import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

// Interfaz que coincide con el formato del backend
export interface ProximityEvent {
  id: string;
  type: string;
  latitude: number;
  longitude: number;
  distance: number;
  home_location_id: string;
  home_location_name: string;
  device_id: string | null;
  user_id: string | null;
  created_at: string | null;
}

interface EventStats {
  totalEvents: number;
  todayEvents: number;
  enterEvents: number;
  exitEvents: number;
  recentEvents: ProximityEvent[];
}

export const useEvents = () => {
  const [events, setEvents] = useState<ProximityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getEvents();
      setEvents(data as ProximityEvent[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const refetch = () => {
    fetchEvents();
  };

  return { events, loading, error, refetch };
};

export const useEventStats = (events: ProximityEvent[] = []): EventStats => {
  const totalEvents = events.length;
  
  const todayEvents = events.filter(event => {
    if (!event.created_at) return false;
    const eventDate = new Date(event.created_at);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  }).length;
  
  const enterEvents = events.filter(event => event.type === 'enter').length;
  const exitEvents = events.filter(event => event.type === 'exit').length;
  
  const recentEvents = events
    .sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  return {
    totalEvents,
    todayEvents,
    enterEvents,
    exitEvents,
    recentEvents,
  };
};
