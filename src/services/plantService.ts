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
