import { Machine } from '@/types/editor';

const API_URL = 'http://localhost:5071/api';

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
