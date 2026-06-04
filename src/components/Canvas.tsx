import { useRef, useState, useCallback, useEffect } from 'react';
import { Point, Sector, Machine, Tool, SectorType } from '@/types/editor';
import SectorModal from './SectorModal';
import { Cpu, Pencil, Palette, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface CanvasProps {
  tool: Tool;
  gridEnabled: boolean;
  sectors: Sector[];
  machines: Machine[];
  onSectorsChange: (sectors: Sector[]) => void;
  onMachinesChange: (machines: Machine[]) => void;
  onPushHistory: () => void;
  onElementRightClick: (element: Sector | Machine) => void;
}

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 10;
const CLOSE_THRESHOLD = 15;

const Canvas = ({
  tool,
  gridEnabled,
  sectors,
  machines,
  onSectorsChange,
  onMachinesChange,
  onPushHistory,
  onElementRightClick,
}: CanvasProps) => {
  const { plantId, versionId } = useParams<{ plantId: string; versionId: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [sectorModal, setSectorModal] = useState<{ points: Point[]; screenPos: Point } | null>(null);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [uiFaded, setUiFaded] = useState(false);

  const isPointInMachine = (point: Point, machine: Machine): boolean => {
    const machineSize = 20; // Assuming a fixed size for machines for now
    return (
      point.x >= machine.position.x &&
      point.x <= machine.position.x + machineSize &&
      point.y >= machine.position.y &&
      point.y <= machine.position.y + machineSize
    );
  };

  const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      const intersect = ((yi > point.y) !== (yj > point.y))
          && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) isInside = !isInside;
    }
    return isInside;
  };

  const screenToCanvas = useCallback(
    (sx: number, sy: number): Point => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return { x: sx, y: sy };
      return {
        x: (sx - rect.left - pan.x) / zoom,
        y: (sy - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  const canvasToScreen = useCallback(
    (cx: number, cy: number): Point => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return { x: cx, y: cy };
      return {
        x: cx * zoom + pan.x + rect.left,
        y: cy * zoom + pan.y + rect.top,
      };
    },
    [pan, zoom]
  );

  const snapToGrid = useCallback(
    (p: Point): Point => {
      if (!gridEnabled) return p;
      return {
        x: Math.round(p.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(p.y / GRID_SIZE) * GRID_SIZE,
      };
    },
    [gridEnabled]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const pos = screenToCanvas(e.clientX, e.clientY);

    const clickedMachine = machines.find(m => isPointInMachine(pos, m));
    if (clickedMachine) {
      onElementRightClick(clickedMachine);
      return;
    }

    const clickedSector = sectors.find(s => isPointInPolygon(pos, s.points));
    if (clickedSector) {
      onElementRightClick(clickedSector);
    }
  }, [screenToCanvas, machines, sectors, onElementRightClick]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(5, zoom * delta));
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setPan({
        x: mx - (mx - pan.x) * (newZoom / zoom),
        y: my - (my - pan.y) * (newZoom / zoom),
      });
      setZoom(newZoom);
    },
    [zoom, pan]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && tool === 'select' && !hoveredSector)) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        return;
      }
      if (tool === 'select' && hoveredSector) {
        setSelectedSector(hoveredSector);
        return;
      }
    },
    [tool, pan, hoveredSector]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        return;
      }
      const canvasP = screenToCanvas(e.clientX, e.clientY);
      setMousePos(snapToGrid(canvasP));
    },
    [isPanning, panStart, screenToCanvas, snapToGrid]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (tool !== 'draw' && tool !== 'sector') return;
      const canvasP = snapToGrid(screenToCanvas(e.clientX, e.clientY));

      if (drawingPoints.length > 2) {
        const first = drawingPoints[0];
        const dist = Math.sqrt((canvasP.x - first.x) ** 2 + (canvasP.y - first.y) ** 2);
        if (dist < CLOSE_THRESHOLD) {
          const center = getCentroid(drawingPoints);
          const screenCenter = canvasToScreen(center.x, center.y);
          setUiFaded(true);
          setSectorModal({ points: [...drawingPoints], screenPos: screenCenter });
          setDrawingPoints([]);
          return;
        }
      }

      setDrawingPoints((prev) => [...prev, canvasP]);
    },
    [tool, drawingPoints, snapToGrid, screenToCanvas, canvasToScreen]
  );

  const handleCanvasClick = useCallback(
    async (e: React.MouseEvent) => {
      if (tool === 'machine') {
        const canvasP = snapToGrid(screenToCanvas(e.clientX, e.clientY));
        onPushHistory();
        // Create a temporary machine locally and let the parent handle the
        // actual persistence when the user confirms in the MachineModal.
        const tempMachine: Machine = {
          id: `machine-${Date.now()}`,
          name: `Machine ${machines.length + 1}`,
          position: { x: canvasP.x, y: canvasP.y },
          status: 'active',
        };

        onMachinesChange([...machines, tempMachine]);
        return;
      }
      handleClick(e);
    },
    [tool, handleClick, snapToGrid, screenToCanvas, machines, onMachinesChange, onPushHistory, plantId]
  );

  const handleSectorConfirm = useCallback(
    (name: string, color: string, type: SectorType) => {
      if (!sectorModal) return;
      onPushHistory();
      const newSector: Sector = {
  id: `sector-${Date.now()}`,
  plantId: plantId ?? '',
  name,
  color,
  type,
  points: sectorModal.points,
      };
      onSectorsChange([...sectors, newSector]);
      setSectorModal(null);
      setUiFaded(false);
    },
    [sectorModal, sectors, onSectorsChange, onPushHistory]
  );

  const handleDeleteSector = useCallback(
    (id: string) => {
      onPushHistory();
      onSectorsChange(sectors.filter((s) => s.id !== id));
      setSelectedSector(null);
    },
    [sectors, onSectorsChange, onPushHistory]
  );

  const handleEscape = useCallback(() => {
    setDrawingPoints([]);
    setSelectedSector(null);
    if (sectorModal) {
      setSectorModal(null);
      setUiFaded(false);
    }
  }, [sectorModal]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleEscape();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleEscape]);

  const getCentroid = (pts: Point[]): Point => {
    const x = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const y = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    return { x, y };
  };

  const pointsToPath = (pts: Point[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

  const renderGrid = () => {
    if (!gridEnabled) return null;
    const size = GRID_SIZE;
    return (
      <pattern id="grid" width={size} height={size} patternUnits="userSpaceOnUse">
        <circle cx={size / 2} cy={size / 2} r={1} fill="hsl(var(--canvas-grid))" />
      </pattern>
    );
  };

  return (
    <>
      <svg
        ref={svgRef}
        className="absolute top-0 left-0 w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setMousePos({ x: -1, y: -1 })}
        onContextMenu={handleContextMenu}
        onClick={handleCanvasClick}
      >
        <defs>
          <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
            <circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r={1} fill="hsl(var(--canvas-grid))" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Grid */}
          {gridEnabled && (
            <rect x={-5000} y={-5000} width={10000} height={10000} fill="url(#grid)" />
          )}

          {/* Sectors */}
          {sectors.map((sector) => (
            <g key={sector.id} className="transition-opacity duration-300" opacity={uiFaded ? 0.5 : 1}>
              <path
                d={pointsToPath(sector.points)}
                fill={sector.color}
                fillOpacity={0.12}
                stroke={sector.color}
                strokeWidth={hoveredSector === sector.id || selectedSector === sector.id ? 2 : 1}
                strokeOpacity={hoveredSector === sector.id || selectedSector === sector.id ? 1 : 0.4}
                className="transition-all duration-200"
                onMouseEnter={() => setHoveredSector(sector.id)}
                onMouseLeave={() => setHoveredSector(null)}
              />
              {/* Sector Name */}
              {(() => {
                const c = getCentroid(sector.points);
                return (
                  <text
                    x={c.x}
                    y={c.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-mono-canvas pointer-events-none select-none"
                    fill={sector.color}
                    fontSize={12 / zoom}
                    fontWeight={600}
                    opacity={0.8}
                  >
                    {sector.name}
                  </text>
                );
              })()}
            </g>
          ))}

          {/* Drawing preview */}
          {drawingPoints.length > 0 && (
            <g>
              <polyline
                points={[...drawingPoints, mousePos].map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5 / zoom}
                strokeDasharray={`${4 / zoom} ${4 / zoom}`}
              />
              {drawingPoints.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={3 / zoom}
                  fill="hsl(var(--primary))"
                />
              ))}
              {/* Close indicator */}
              {drawingPoints.length > 2 && (() => {
                const first = drawingPoints[0];
                const dist = Math.sqrt((mousePos.x - first.x) ** 2 + (mousePos.y - first.y) ** 2);
                if (dist < CLOSE_THRESHOLD) {
                  return (
                    <circle
                      cx={first.x}
                      cy={first.y}
                      r={6 / zoom}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2 / zoom}
                      className="animate-pulse-once"
                    />
                  );
                }
                return null;
              })()}
            </g>
          )}

          {/* Machines */}
          {machines.map((machine) => (
            <g key={machine.id} transform={`translate(${machine.position.x},${machine.position.y})`}>
              <rect
                x={-12}
                y={-12}
                width={24}
                height={24}
                rx={6}
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
                strokeWidth={1}
              />
              <circle
                cx={8}
                cy={-8}
                r={3}
                fill={
                  machine.status === 'active'
                    ? 'hsl(var(--status-active))'
                    : machine.status === 'warning'
                    ? 'hsl(var(--status-warning))'
                    : 'hsl(var(--status-error))'
                }
              />
              <foreignObject x={-8} y={-8} width={16} height={16}>
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Cpu size={12} />
                </div>
              </foreignObject>
            </g>
          ))}
        </g>
      </svg>

      {/* Sector contextual toolbar */}
      {hoveredSector && !sectorModal && (() => {
        const sector = sectors.find((s) => s.id === hoveredSector);
        if (!sector) return null;
        const c = getCentroid(sector.points);
        const screen = canvasToScreen(c.x, c.y);
        return (
          <div
            className="fixed z-50 toolbar-island flex items-center gap-0.5 p-1 animate-fade-in pointer-events-auto"
            style={{ left: screen.x, top: screen.y - 40, transform: 'translateX(-50%)' }}
          >
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Pencil size={12} />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Palette size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSector(sector.id);
              }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      })()}

      {/* Sector Creation Modal */}
      {sectorModal && (
        <SectorModal
          position={sectorModal.screenPos}
          onConfirm={handleSectorConfirm}
          onCancel={() => {
            setSectorModal(null);
            setUiFaded(false);
          }}
        />
      )}

      {/* Zoom indicator */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border text-[11px] text-muted-foreground font-medium">
        {Math.round(zoom * 100)}%
      </div>

      {/* Auto-saved indicator */}
      <div className="fixed top-14 left-1/2 -translate-x-1/2 z-30 text-[10px] text-muted-foreground/60 font-medium">
        Auto-saved
      </div>
    </>
  );
};

export default Canvas;
