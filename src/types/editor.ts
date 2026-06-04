export interface Point {
  x: number;
  y: number;
}

export interface Sector {
  id: string;
  plantId: string;
  name: string;
  color: string;
  type: SectorType;
  points: Point[];
}

export type SectorType = 'laboratory' | 'industrial' | 'corridor' | 'storage' | 'custom';

export interface Machine {
  id: string;
  name: string;
  position: Point;
  status: 'active' | 'warning' | 'error';
  sectorId?: string;
}

export type Tool = 'select' | 'draw' | 'sector' | 'machine';

export interface EditorState {
  tool: Tool;
  zoom: number;
  pan: Point;
  gridEnabled: boolean;
  sectors: Sector[];
  machines: Machine[];
  drawingPoints: Point[];
  selectedSectorId: string | null;
  history: HistoryEntry[];
  historyIndex: number;
}

export interface HistoryEntry {
  sectors: Sector[];
  machines: Machine[];
}
