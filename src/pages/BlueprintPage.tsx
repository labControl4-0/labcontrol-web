import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tool } from '@/types/editor';
import TopNav from '@/components/TopNav';
import LeftToolbar from '@/components/LeftToolbar';
import DashboardPanel from '@/components/DashboardPanel';
import Canvas from '@/components/Canvas';
import MachineModal from '@/components/MachineModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { getPlantVersions } from '../services/plantVersionService';
import { createSector, getSectors, deleteSector } from '../services/sectorService';
import { createMachine, getMachines, deleteMachine } from '../services/machineService';
import { getPlantById } from '../services/plantService';
import { Sector as ApiSector } from '../interfaces/Sector';
import { Machine as ApiMachine } from '../interfaces/Machine';
import { Sector, Machine, HistoryEntry } from '@/types/editor';

// Helper to convert API data to editor data format
const convertToEditorSector = (apiSectors: ApiSector[]): Sector[] => {
  return apiSectors.map(s => {
    try {
      const apiPoints: { X: number, Y: number }[] = JSON.parse(s.pointsJson);
      const editorPoints = apiPoints.map(p => ({ x: p.X, y: p.Y })); // Correctly map points
      return {
        id: s.id,
        type: 'custom',
        name: s.name,
        color: s.color,
        points: editorPoints,
      };
    } catch (e) {
      console.error("Failed to parse points for sector", s.id, e);
      return { id: s.id, type: 'custom', name: s.name, color: s.color, points: [] };
    }
  });
};

const convertToEditorMachine = (apiMachines: ApiMachine[]): Machine[] => {
  return apiMachines.map(m => ({
    id: m.id,
    name: m.name,
    position: { x: m.posX, y: m.posY },
    status: m.status.toLowerCase() === 'running' ? 'active' : m.status.toLowerCase() === 'stopped' ? 'error' : 'warning',
  }));
};


const BlueprintPage = () => {
  const { plantId } = useParams<{ plantId: string }>();
  const [plantName, setPlantName] = useState<string>('');
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>('select');
  const [gridEnabled, setGridEnabled] = useState(true);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMachine, setNewMachine] = useState<Omit<Machine, 'name' | 'status'> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: 'sector' | 'machine' } | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      if (!plantId) return;
      setLoading(true);
      try {
        // Fetch plant name
        const plantData = await getPlantById(plantId);
        setPlantName(plantData.name);

        // Fetch plant versions
        const versions = await getPlantVersions(plantId);
        let activeVersion = versions.find(v => v.isActive);
        if (!activeVersion && versions.length > 0) {
          activeVersion = versions.sort((a, b) => b.versionNumber - a.versionNumber)[0];
        }
        if (activeVersion) {
          setActiveVersionId(activeVersion.id); // Save active version ID
        }

        let fetchedSectors: Sector[] = [];
        if (activeVersion) {
          const sectorsData = await getSectors(activeVersion.id);
          fetchedSectors = convertToEditorSector(sectorsData);
          setSectors(fetchedSectors);
        }

        const machinesData = await getMachines(plantId);
        const fetchedMachines = convertToEditorMachine(machinesData);
        setMachines(fetchedMachines);

        // Initialize history
        const initialEntry = { sectors: fetchedSectors, machines: fetchedMachines };
        setHistory([initialEntry]);
        setHistoryIndex(0);

      } catch (err) {
        console.error("Failed to fetch blueprint data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [plantId]);

  const handleSectorsChange = async (newSectors: Sector[]) => {
    // Detect if a new sector was added (the one without a real ID)
    const newSector = newSectors.find(s => !sectors.some(os => os.id === s.id));

    if (newSector && activeVersionId) {
      try {
        const createdSector = await createSector({
          plantVersionId: activeVersionId,
          name: newSector.name,
          type: newSector.type,
          color: newSector.color,
          points: newSector.points,
        });
        // Replace the temporary sector with the one from the backend
        const updatedSectors = newSectors.map(s => s.id === newSector.id ? convertToEditorSector([createdSector])[0] : s);
        setSectors(updatedSectors);
      } catch (error) {
        console.error("Failed to save new sector:", error);
        // Optionally revert the change
        setSectors(sectors);
      }
    } else {
      // Handle updates for existing sectors if needed
      setSectors(newSectors);
    }
  };

  const handleMachinesChange = (newMachines: Machine[]) => {
    const addedMachine = newMachines.find(m => !machines.some(om => om.id === m.id));

    if (addedMachine) {
      setNewMachine(addedMachine);
      setIsModalOpen(true);
    } else {
      setMachines(newMachines);
    }
  };

  const handleSaveMachine = async (name: string, model: string, status: string) => {
    if (!newMachine || !plantId) return;

    // Find which sector the machine is in
    const sector = sectors.find(s =>
        newMachine.position.x >= s.points[0].x && newMachine.position.x <= s.points[2].x &&
        newMachine.position.y >= s.points[0].y && newMachine.position.y <= s.points[2].y
    );

    if (!sector) {
        console.error("Machine must be placed inside a sector.");
        // Revert the temporary machine add
        setMachines(machines);
        setIsModalOpen(false);
        return;
    }

    try {
      const createdMachine = await createMachine({
        plantId: plantId,
        sectorId: sector.id,
        name: name,
        model: model,
        posX: newMachine.position.x,
        posY: newMachine.position.y,
        status: status,
      });

      const finalMachine = convertToEditorMachine([createdMachine])[0];
      setMachines(prev => [...prev.filter(m => m.id !== newMachine.id), finalMachine]);
      setIsModalOpen(false);
      setNewMachine(null);

    } catch (error) {
      console.error("Failed to save machine:", error);
      // Revert the temporary machine add
      setMachines(machines);
      setIsModalOpen(false);
    }
  };

  const handleElementRightClick = (element: Sector | Machine) => {
    const type = 'points' in element ? 'sector' : 'machine';
    setDeleteTarget({ id: element.id, name: element.name, type });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'sector') {
        await deleteSector(deleteTarget.id);
        setSectors(prev => prev.filter(s => s.id !== deleteTarget.id));
        // Also remove machines that were in the deleted sector
        setMachines(prev => prev.filter(m => m.sectorId !== deleteTarget.id));
      } else {
        await deleteMachine(deleteTarget.id);
        setMachines(prev => prev.filter(m => m.id !== deleteTarget.id));
      }
    } catch (error) {
      console.error(`Failed to delete ${deleteTarget.type}:`, error);
    } finally {
      setDeleteTarget(null);
    }
  };


  const pushHistory = useCallback(() => {
    const entry: HistoryEntry = { sectors: [...sectors], machines: [...machines] };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(entry);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [sectors, machines, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    setSectors(prev.sectors);
    setMachines(prev.machines);
    setHistoryIndex(historyIndex - 1);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    setSectors(next.sectors);
    setMachines(next.machines);
    setHistoryIndex(historyIndex + 1);
  }, [history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undo();
      } else if (e.key === 'v') setTool('select');
      else if (e.key === 'd') setTool('draw');
      else if (e.key === 's' && !e.ctrlKey && !e.metaKey) setTool('sector');
      else if (e.key === 'm') setTool('machine');
      else if (e.key === 'g') setGridEnabled((g) => !g);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  if (loading) {
    return <div>Loading Blueprint...</div>;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-background">
      <Canvas
        tool={tool}
        gridEnabled={gridEnabled}
        sectors={sectors}
        machines={machines}
        onSectorsChange={handleSectorsChange}
        onMachinesChange={handleMachinesChange}
        onPushHistory={pushHistory}
        onElementRightClick={handleElementRightClick}
      />
      <TopNav plantName={plantName} />
      <LeftToolbar
        activeTool={tool}
        onToolChange={setTool}
        gridEnabled={gridEnabled}
        onToggleGrid={() => setGridEnabled((g) => !g)}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
      <DashboardPanel machines={machines} />
      <MachineModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setMachines(machines); // Revert if modal is closed without saving
        }}
        onSave={handleSaveMachine}
      />
      {deleteTarget && (
        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          itemName={deleteTarget.name}
          itemType={deleteTarget.type}
        />
      )}
    </div>
  );
};

export default BlueprintPage;
