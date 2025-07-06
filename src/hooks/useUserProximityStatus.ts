import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

export interface UserProximityStatus {
  isAtHome: boolean;
  lastEvent: 'enter' | 'exit' | null;
  lastEventTime: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para verificar si el usuario está actualmente en casa
 * basado en el último evento de proximidad
 */
export const useUserProximityStatus = () => {
  const [status, setStatus] = useState<UserProximityStatus>({
    isAtHome: false,
    lastEvent: null,
    lastEventTime: null,
    loading: false,
    error: null,
  });

  const checkProximityStatus = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      
      // Obtener el último evento de proximidad del usuario
      const events = await apiService.getEvents();
      
      if (events.length === 0) {
        // No hay eventos = usuario fuera de casa por defecto
        setStatus({
          isAtHome: false,
          lastEvent: null,
          lastEventTime: null,
          loading: false,
          error: null,
        });
        return;
      }
      
      // Ordenar eventos por fecha (más reciente primero)
      const sortedEvents = events.sort((a, b) => {
        const dateA = new Date(a.created_at || '').getTime();
        const dateB = new Date(b.created_at || '').getTime();
        return dateB - dateA;
      });
      
      const latestEvent = sortedEvents[0];
      const isAtHome = latestEvent.type === 'enter';

      setStatus({
        isAtHome,
        lastEvent: latestEvent.type as 'enter' | 'exit',
        lastEventTime: latestEvent.created_at,
        loading: false,
        error: null,
      });
      
    } catch (err: any) {
      console.error('Error checking proximity status:', err);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Error al verificar estado de proximidad',
      }));
    }
  }, []);

  // Verificar estado inicial
  useEffect(() => {
    checkProximityStatus();
  }, [checkProximityStatus]);

  // Refrescar cada 10 segundos para mantener sincronizado
  useEffect(() => {
    const interval = setInterval(checkProximityStatus, 10000);
    return () => clearInterval(interval);
  }, [checkProximityStatus]);

  return {
    ...status,
    refresh: checkProximityStatus,
  };
};
