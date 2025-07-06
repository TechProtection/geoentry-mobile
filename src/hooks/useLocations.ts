import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { HomeLocation } from '../types/location';

export const useLocations = () => {
  const [locations, setLocations] = useState<HomeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getLocations();
      
      setLocations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar ubicaciones';
      console.error('Error fetching locations:', err);
      console.error('Error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const refetch = () => {
    fetchLocations();
  };

  return { locations, loading, error, refetch };
};
