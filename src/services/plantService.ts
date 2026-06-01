import { Plant } from '../interfaces/Plant';

const API_BASE_URL = 'http://localhost:5071';

export const getPlants = async (): Promise<Plant[]> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/plants`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch plants');
  }

  return response.json();
};

export const getPlantById = async (plantId: string): Promise<Plant> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/plants/${plantId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch plant');
  }

  return response.json();
};

export const createPlant = async (plantData: {
  name: string;
  description?: string;
  scale: number;
  widthUnits: number;
  heightUnits: number;
}): Promise<Plant> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/plants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(plantData),
  });

  if (!response.ok) {
    throw new Error('Failed to create plant');
  }

  return response.json();
};

export const updatePlant = async (plantId: string, plantData: {
  name: string;
  description?: string;
  scale: number;
  widthUnits: number;
  heightUnits: number;
}): Promise<void> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/plants/${plantId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(plantData),
  });

  if (!response.ok) {
    throw new Error('Failed to update plant');
  }
};

export const deletePlant = async (plantId: string): Promise<void> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/plants/${plantId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete plant');
  }
};