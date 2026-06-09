import { Sector } from '../interfaces/Sector';

const API_BASE_URL = '/api';

export const getSectorsByPlant = async (plantId: string): Promise<Sector[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/sectors/plant/${plantId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch sectors');
  }

  const sectors = await response.json();
  return sectors.map((sector: any) => ({
    ...sector,
    points: JSON.parse(sector.pointsJson),
  }));
};

export interface CreateSectorDto {
  plantId: string;
  name: string;
  type: string;
  color: string;
  points: { x: number; y: number }[];
}

export const createSector = async (sectorData: CreateSectorDto): Promise<Sector> => {
  const token = localStorage.getItem('token');

  const payload = {
    ...sectorData,
    points: sectorData.points.map(p => ({ X: p.x, Y: p.y })),
    areaM2: 0,
  };

  const response = await fetch(`${API_BASE_URL}/sectors`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create sector: ${errorText}`);
  }

  const createdSector = await response.json();
  return { ...createdSector, points: JSON.parse(createdSector.pointsJson) };
};

export const deleteSector = async (sectorId: string): Promise<void> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/sectors/${sectorId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete sector: ${errorText}`);
  }
};
