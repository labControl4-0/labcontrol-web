import { Machine } from '../interfaces/Machine';

const API_BASE_URL = '';

export const getMachines = async (plantId: string): Promise<Machine[]> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/machines/plant/${plantId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch machines');
  }

  return response.json();
};

export interface CreateMachineDto {
  plantId: string;
  sectorId: string;
  name: string;
  model: string;
  posX: number;
  posY: number;
  status: string;
}

export const createMachine = async (machineData: CreateMachineDto): Promise<Machine> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/machines`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(machineData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create machine: ${errorText}`);
  }

  return response.json();
};

export const deleteMachine = async (machineId: string): Promise<void> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/machines/${machineId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete machine: ${errorText}`);
  }
};
