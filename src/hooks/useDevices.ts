import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export interface Device {
  id: string;
  name: string;
  type: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
}

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDevices();
      setDevices(data as Device[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar dispositivos');
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const refetch = () => {
    fetchDevices();
  };

  return { devices, loading, error, refetch };
};

export const getDeviceName = (deviceId: string | null, devices: Device[]): string => {
  if (!deviceId) return 'Dispositivo Desconocido';
  
  const device = devices.find(d => d.id === deviceId);
  return device ? device.name : 'Dispositivo Desconocido';
};
