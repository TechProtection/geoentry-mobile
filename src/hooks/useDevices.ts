import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export interface Device {
  id: string;
  name: string;
  type: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    full_name: string;
    email: string;
  };
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

export const useDeviceStats = (devices: Device[] = [], events: any[] = []) => {
  const totalDevices = devices.length;
  const activeDevices = devices.length; // Todos están activos por ahora
  
  // Calcular dispositivos con actividad reciente (último día)
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  
  const recentlyActiveDevices = devices.filter(device => {
    return events.some(event => 
      event.device_id === device.id && 
      event.created_at && 
      new Date(event.created_at) > yesterday
    );
  });
  
  const devicesOutOfZone = Math.max(0, totalDevices - recentlyActiveDevices.length);
  const inactiveDevices = 0; // Por ahora no tenemos lógica para esto

  return {
    totalDevices,
    activeDevices: recentlyActiveDevices.length,
    devicesOutOfZone,
    inactiveDevices,
  };
};
