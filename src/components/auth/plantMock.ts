import type { MachineStatus } from "./MachineStatusDot";

// Demo data for the sign-in showcase only: not connected to the API

export interface MockMachine {
  id: string;
  sector: 0 | 1 | 2;
  // Position inside the map, as a fraction of its width and height
  x: number;
  y: number;
}

export interface StatusEvent {
  machineId: string;
  status: MachineStatus;
  message: string;
}

export const MOCK_SECTORS = ["Sector 1", "Sector 2", "Sector 3"] as const;

export const MOCK_MACHINES: MockMachine[] = [
  { id: "PRS-01", sector: 0, x: 0.1, y: 0.42 },
  { id: "CNC-02", sector: 0, x: 0.23, y: 0.74 },
  { id: "CNC-04", sector: 1, x: 0.44, y: 0.74 },
  { id: "WLD-03", sector: 1, x: 0.56, y: 0.38 },
  { id: "PCK-05", sector: 2, x: 0.84, y: 0.56 },
];

// Conveyor order: materials flow from PRS-01 to PCK-05
export const MOCK_CONVEYOR = MOCK_MACHINES.map((machine) => machine.id);

export const INITIAL_STATUSES: Record<string, MachineStatus> = {
  "PRS-01": "running",
  "CNC-02": "running",
  "CNC-04": "running",
  "WLD-03": "warning",
  "PCK-05": "stopped",
};

// Applied one by one; after the last event every machine is back to INITIAL_STATUSES
export const STATUS_CYCLE: StatusEvent[] = [
  { machineId: "WLD-03", status: "running", message: "back to normal" },
  { machineId: "PCK-05", status: "running", message: "back online" },
  { machineId: "CNC-04", status: "warning", message: "high temperature" },
  { machineId: "CNC-02", status: "stopped", message: "stopped" },
  { machineId: "CNC-04", status: "running", message: "back to normal" },
  { machineId: "CNC-02", status: "running", message: "back online" },
  { machineId: "WLD-03", status: "warning", message: "vibration alert" },
  { machineId: "PCK-05", status: "stopped", message: "stopped" },
];

const POWER_KW: Record<MachineStatus, number> = { running: 42, warning: 36, stopped: 0 };

export interface PlantKpis {
  energyKw: number;
  oee: number;
  activeAlerts: number;
}

// KPIs follow the machine statuses so the numbers react to what the map shows
export const computeKpis = (statuses: Record<string, MachineStatus>): PlantKpis => {
  const values = Object.values(statuses);
  const running = values.filter((status) => status === "running").length;
  const warning = values.filter((status) => status === "warning").length;

  return {
    energyKw: values.reduce((total, status) => total + POWER_KW[status], 0),
    oee: Math.round((92 * (running + 0.7 * warning)) / values.length),
    activeAlerts: values.length - running,
  };
};

// Recent history so the sparklines have a shape on first paint
export const KPI_HISTORY_SEED: Record<keyof PlantKpis, number[]> = {
  energyKw: [118, 126, 122, 131, 128, 136, 132, 120],
  oee: [64, 68, 66, 71, 69, 72, 70, 65],
  activeAlerts: [3, 2, 2, 1, 2, 1, 1, 2],
};
