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
import { createSector, getSectorsByPlant, deleteSector } from '../services/sectorService';
import { getMachinesByPlant, createMachineApi, deleteMachine } from '../services/machineApiService';
import { getPlantById } from '../services/plantService';
import { Sector as ApiSector } from '../interfaces/Sector';
import { Machine as ApiMachine } from '../interfaces/Machine';
import { Sector, Machine, HistoryEntry, Point } from '@/types/editor';
import { useToast } from "@/hooks/use-toast";

// Helper to convert API data to editor data format
const convertToEditorSector = (apiSectors: ApiSector[]): Sector[] => {
  return apiSectors.map(s => {
    try {
      // Support two shapes coming from services: either a pointsJson string
      // (from the API) or an already-parsed `points` array (some services
      // parse it before returning). Normalize both to editor Point[] format.
      let apiPoints: { X: number; Y: number }[] = [];
      if ((s as any).points && Array.isArray((s as any).points)) {
        apiPoints = (s as any).points;
      } else if (typeof s.pointsJson === 'string') {
        apiPoints = JSON.parse(s.pointsJson);
      }

  const editorPoints = apiPoints.map(p => ({ x: (p as any).X ?? (p as any).x, y: (p as any).Y ?? (p as any).y }));
      return {
        id: s.id,
        plantId: (s as any).plantId ?? '',
        type: 'custom',
        name: s.name,
        color: s.color,
        points: editorPoints,
      };
    } catch (e) {
      console.error("Failed to parse points for sector", s.id, e);
  return { id: s.id, plantId: (s as any).plantId ?? '', type: 'custom', name: s.name, color: s.color, points: [] };
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
  const { plantId, versionId } = useParams<{ plantId: string; versionId: string }>();
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

  const { toast } = useToast();


  useEffect(() => {
    const fetchData = async () => {
      if (!plantId) return;
      setLoading(true);
      try {
        // Fetch plant name
        const plantData = await getPlantById(plantId);
        setPlantName(plantData.name);

        // Fetch plant versions (API may return a single object or an array)
        const versionsResp = await getPlantVersions(plantId);
        const versions = Array.isArray(versionsResp) ? versionsResp : [versionsResp];
        let activeVersion = versions.find(v => (v as any)?.isActive);
        if (!activeVersion && versions.length > 0) {
          activeVersion = versions.sort((a, b) => ((b as any).versionNumber ?? 0) - ((a as any).versionNumber ?? 0))[0];
        }
        if (activeVersion) {
          setActiveVersionId(activeVersion.id); // Save active version ID
        }

        let fetchedSectors: Sector[] = [];
        if (plantId) {
          const sectorsData = await getSectorsByPlant(plantId);
          fetchedSectors = convertToEditorSector(sectorsData);
          console.log('BlueprintPage: fetched sectors (raw):', sectorsData);
          console.log('BlueprintPage: converted sectors (editor):', fetchedSectors);
          setSectors(fetchedSectors);
        }

        if (plantId) {
          const machinesData = await getMachinesByPlant(plantId);
          setMachines(machinesData);
        }

        // Initialize history
        const initialEntry = { sectors: fetchedSectors, machines: machines };
        setHistory([initialEntry]);
        setHistoryIndex(0);

      } catch (err) {
        console.error("Failed to fetch blueprint data", err);
        toast({
          title: "Error fetching data",
          description: "Could not load blueprint data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [plantId]);

  const handleSectorsChange = async (newSectors: Sector[]) => {
    // Detect if a new sector was added (the one without a real ID)
    const newSector = newSectors.find(s => !sectors.some(os => os.id === s.id));

    if (newSector && plantId) {
      try {
        const createdSector = await createSector({
          plantId: plantId,
          name: newSector.name,
          type: newSector.type,
          color: newSector.color,
          points: newSector.points as Point[],
        });
        // Replace the temporary sector with the one from the backend
        const updatedSectors = newSectors.map(s => s.id === newSector.id ? convertToEditorSector([createdSector])[0] : s);
        setSectors(updatedSectors);
        toast({
          title: "Sector Saved",
          description: `Sector "${createdSector.name}" has been successfully saved.`,
        });
      } catch (error) {
        console.error("Failed to save new sector:", error);
        toast({
          title: "Error Saving Sector",
          description: "An unexpected error occurred while saving the sector.",
          variant: "destructive",
        });
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
      // Temporarily add the machine to the UI for better UX
      setMachines(newMachines);
    } else {
      // This case might be for deletion or updates, ensure state is correctly updated
      setMachines(newMachines);
    }
  };

  const handleSaveMachine = async (name: string, model: string, status: 'active' | 'warning' | 'error') => {
    if (!newMachine || !plantId) return;

    // Find which sector the machine is in
    const sector = sectors.find(s =>
        newMachine.position.x >= s.points[0].x && newMachine.position.x <= s.points[2].x &&
        newMachine.position.y >= s.points[0].y && newMachine.position.y <= s.points[2].y
    );

    if (!sector) {
        console.error("Machine must be placed inside a sector.");
        toast({
            title: "Invalid Machine Placement",
            description: "A machine must be placed inside a valid sector.",
            variant: "destructive",
        });
        // Revert the temporary machine add
        setMachines(machines);
        setIsModalOpen(false);
        return;
    }

    try {
      const createdMachine = await createMachineApi({
        plantId: plantId,
        sectorId: sector.id,
        name: name,
        model: model,
        posX: newMachine.position.x,
        posY: newMachine.position.y,
        status: status,
      });

      setMachines(prev => [...prev.filter(m => m.id !== newMachine.id), createdMachine]);
      setIsModalOpen(false);
      setNewMachine(null);
      toast({
        title: "Machine Saved",
        description: `Machine "${createdMachine.name}" has been successfully saved.`,
      });

    } catch (error) {
      console.error("Failed to save machine:", error);
      toast({
        title: "Error Saving Machine",
        description: "An unexpected error occurred while saving the machine.",
        variant: "destructive",
      });
      // Revert the temporary machine add
      setMachines(machines.filter(m => m.id !== newMachine.id));
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
        // First, delete all machines within the sector
        const machinesInSector = machines.filter(m => {
          const sector = sectors.find(s => s.id === deleteTarget.id);
          if (!sector) return false;
          // Simple bounding box check, assuming rectangular sectors for this logic
          const xs = sector.points.map(p => p.x);
          const ys = sector.points.map(p => p.y);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);
          return m.position.x >= minX && m.position.x <= maxX && m.position.y >= minY && m.position.y <= maxY;
        });
  
        await Promise.all(machinesInSector.map(m => deleteMachine(m.id)));
  
        // Then, delete the sector itself
        await deleteSector(deleteTarget.id);
  
        // Update state
        setSectors(prev => prev.filter(s => s.id !== deleteTarget.id));
        setMachines(prev => prev.filter(m => !machinesInSector.some(ms => ms.id === m.id)));
  
      } else {
        await deleteMachine(deleteTarget.id);
        setMachines(prev => prev.filter(m => m.id !== deleteTarget.id));
      }
      toast({
        title: `${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} Deleted`,
        description: `The ${deleteTarget.type} "${deleteTarget.name}" has been deleted.`,
      });
    } catch (error) {
      console.error(`Failed to delete ${deleteTarget.type}:`, error);
      toast({
        title: `Error Deleting ${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)}`,
        description: `Could not delete the ${deleteTarget.type}. Please try again.`,
        variant: "destructive",
      });
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

  console.log('BlueprintPage: sectors passed to Canvas', sectors);

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
          // Revert the temporary add if the modal is closed without saving
          if (newMachine) {
            setMachines(machines.filter(m => m.id !== newMachine.id));
          }
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
