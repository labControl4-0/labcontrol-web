import { PlantVersion } from '../interfaces/PlantVersion';

const API_BASE_URL = 'http://localhost:5071';

export const getPlantVersions = async (plantId: string): Promise<PlantVersion[]> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/plants/${plantId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch plant versions');
  }

  return response.json();
};
