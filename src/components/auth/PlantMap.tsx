import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { MachineStatus } from "./MachineStatusDot";
import { MOCK_CONVEYOR, MOCK_MACHINES, MOCK_SECTORS } from "./plantMock";

interface PlantMapProps {
  statuses: Record<string, MachineStatus>;
  className?: string;
  // Overlays such as the status toast
  children?: ReactNode;
}

const STATUS_COLOR: Record<MachineStatus, string> = {
  running: "#22C55E",
  warning: "#FBBF24",
  stopped: "#F87171",
};

const MACHINE_RADIUS = 16;
const STATUSES: MachineStatus[] = ["running", "warning", "stopped"];

// Conveyor between two machines: horizontal, vertical, horizontal, ending short of each machine
const conveyorPath = (x1: number, y1: number, x2: number, y2: number) => {
  const middleX = (x1 + x2) / 2;
  return `M ${x1 + MACHINE_RADIUS} ${y1} H ${middleX} V ${y2} H ${x2 - MACHINE_RADIUS}`;
};

const PlantMap = ({ statuses, className, children }: PlantMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  // Drawn in real pixels so the map fills the column without stretching the circles
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const counts = STATUSES.map((status) => Object.values(statuses).filter((s) => s === status).length);
  const label = `Plant map with ${MOCK_MACHINES.length} machines in ${MOCK_SECTORS.length} sectors: ${counts[0]} running, ${counts[1]} in warning, ${counts[2]} stopped`;

  return (
    <div ref={containerRef} role="img" aria-label={label} className={cn("relative w-full", className)}>
      {size && size.width > 0 && size.height > 0 && (
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          aria-hidden="true"
          className="absolute inset-0"
        >
          {/* Sector outline and dividers */}
          <rect
            x={0.75}
            y={0.75}
            width={size.width - 1.5}
            height={size.height - 1.5}
            rx={6}
            fill="none"
            stroke="rgba(147,197,253,0.45)"
            strokeWidth={1.5}
            pathLength={1}
            className="auth-draw"
          />
          {[1, 2].map((divider) => (
            <line
              key={divider}
              x1={(size.width * divider) / 3}
              x2={(size.width * divider) / 3}
              y1={0}
              y2={size.height}
              stroke="rgba(147,197,253,0.35)"
              strokeDasharray="4 4"
              className="auth-fade-in"
              style={{ animationDelay: "0.45s" }}
            />
          ))}
          {MOCK_SECTORS.map((sector, index) => (
            <text
              key={sector}
              x={(size.width * index) / 3 + 12}
              y={22}
              fill="#93C5FD"
              fontSize={11}
              fontWeight={600}
              letterSpacing="0.08em"
              className="auth-fade-in"
              style={{ animationDelay: "0.35s" }}
            >
              {sector.toUpperCase()}
            </text>
          ))}

          {/* Conveyors: particles only flow while both ends are not stopped */}
          <g className="auth-fade-in" style={{ animationDelay: "0.7s" }}>
            {MOCK_CONVEYOR.slice(1).map((toId, index) => {
              const fromId = MOCK_CONVEYOR[index];
              const from = MOCK_MACHINES.find((machine) => machine.id === fromId)!;
              const to = MOCK_MACHINES.find((machine) => machine.id === toId)!;
              const d = conveyorPath(
                from.x * size.width,
                from.y * size.height,
                to.x * size.width,
                to.y * size.height,
              );
              const flowing = statuses[fromId] !== "stopped" && statuses[toId] !== "stopped";

              return (
                <g key={toId}>
                  <path d={d} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth={2} />
                  <path
                    d={d}
                    fill="none"
                    stroke="#60A5FA"
                    strokeWidth={2}
                    strokeLinecap="round"
                    className="auth-flow auth-layer"
                    style={{ opacity: flowing ? 0.9 : 0 }}
                  />
                </g>
              );
            })}
          </g>

          {/* Machines: one layer per status, cross-faded with opacity */}
          {MOCK_MACHINES.map((machine, index) => {
            const status = statuses[machine.id];
            return (
              <g key={machine.id} transform={`translate(${machine.x * size.width} ${machine.y * size.height})`}>
                <g className="auth-pop-in" style={{ animationDelay: `${0.3 + index * 0.12}s` }}>
                  <g className="auth-layer" style={{ opacity: status === "running" ? 1 : 0 }}>
                    <circle r={13} fill={STATUS_COLOR.running} className="auth-ring auth-ring-running" />
                  </g>
                  <g className="auth-layer" style={{ opacity: status === "warning" ? 1 : 0 }}>
                    <circle r={13} fill={STATUS_COLOR.warning} className="auth-ring auth-ring-warning" />
                  </g>
                  <circle r={7} fill={STATUS_COLOR.running} className="auth-layer" style={{ opacity: status === "running" ? 1 : 0 }} />
                  <circle r={7} fill={STATUS_COLOR.warning} className="auth-layer" style={{ opacity: status === "warning" ? 1 : 0 }} />
                  <circle
                    r={6}
                    fill="#7F1D1D"
                    stroke={STATUS_COLOR.stopped}
                    strokeWidth={2}
                    className="auth-layer"
                    style={{ opacity: status === "stopped" ? 1 : 0 }}
                  />
                  <text y={28} textAnchor="middle" fontSize={10} fill="#CBD5E1" className="font-mono">
                    {machine.id}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      )}
      {children}
    </div>
  );
};

export default PlantMap;
