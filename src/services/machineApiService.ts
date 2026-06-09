import { Machine } from '@/types/editor';

const API_URL = '/api';

export const createMachineApi = async (machineData: {
  plantId: string;
  sectorId: string | null;
  name: string;
  model: string;
  posX: number;
  posY: number;
  status: 'active' | 'warning' | 'error';
}): Promise<Machine> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }
  const response = await fetch(`${API_URL}/machines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(machineData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to create machine:', errorText);
    throw new Error('Failed to create machine');
  }

  const createdMachine = await response.json();

  return {
    id: createdMachine.id,
    name: createdMachine.name,
    position: { x: createdMachine.posX, y: createdMachine.posY },
    status: createdMachine.status,
  };
};

export const getMachinesByPlant = async (plantId: string): Promise<Machine[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/machines/plant/${plantId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch machines');
    }

    const machines = await response.json();
    return machines.map((machine: any) => ({
        id: machine.id,
        name: machine.name,
        status: machine.status,
        position: { x: machine.posX, y: machine.posY },
    }));
};

export const deleteMachine = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }
  const response = await fetch(`${API_URL}/machines/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete machine');
  }
};
