import { useState, useEffect } from 'react';
import { useEvents } from './useEvents';
import { useDevices } from './useDevices';
import { useLocations } from './useLocations';

interface AnalyticsMetrics {
  todayEvents: number;
  totalEnters: number;
  totalExits: number;
  activeDevices: number;
  enterExitRatio: number;
}

interface ChartData {
  timeChart: Array<{
    location: string;
    entradas: number;
    salidas: number;
  }>;
  deviceChart: Array<{
    device: string;
    eventos: number;
  }>;
}

interface DeviceAnalysis {
  device_name: string;
  total_events: number;
  last_event: string;
}

export const useAnalytics = () => {
  const { events, loading: eventsLoading } = useEvents();
  const { devices, loading: devicesLoading } = useDevices();
  const { locations, loading: locationsLoading } = useLocations();
  
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    todayEvents: 0,
    totalEnters: 0,
    totalExits: 0,
    activeDevices: 0,
    enterExitRatio: 0,
  });

  const [chartData, setChartData] = useState<ChartData>({
    timeChart: [],
    deviceChart: [],
  });

  const [deviceAnalysis, setDeviceAnalysis] = useState<DeviceAnalysis[]>([]);

  const isLoading = eventsLoading || devicesLoading || locationsLoading;

  useEffect(() => {
    if (!events.length) {
      // Si no hay eventos, establecer valores por defecto
      setMetrics({
        todayEvents: 0,
        totalEnters: 0,
        totalExits: 0,
        activeDevices: devices.length,
        enterExitRatio: 0,
      });
      
      setChartData({
        timeChart: [],
        deviceChart: [],
      });
      
      setDeviceAnalysis([]);
      return;
    }

    // Calcular métricas
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEvents = events.filter(event => {
      if (!event.created_at) return false;
      const eventDate = new Date(event.created_at);
      return eventDate >= today;
    }).length;

    const totalEnters = events.filter(event => event.type === 'enter').length;
    const totalExits = events.filter(event => event.type === 'exit').length;
    const activeDevices = devices.length;
    const enterExitRatio = totalExits > 0 ? totalEnters / totalExits : totalEnters;

    setMetrics({
      todayEvents,
      totalEnters,
      totalExits,
      activeDevices,
      enterExitRatio,
    });

    // Preparar datos para gráficos
    const locationStats = locations.map(location => {
      const locationEvents = events.filter(event => event.home_location_id === location.id);
      const entradas = locationEvents.filter(event => event.type === 'enter').length;
      const salidas = locationEvents.filter(event => event.type === 'exit').length;
      
      return {
        location: location.name.length > 8 ? location.name.substring(0, 8) + '...' : location.name,
        entradas,
        salidas,
      };
    });

    const deviceStats = devices.map(device => {
      const deviceEvents = events.filter(event => event.device_id === device.id);
      return {
        device: device.name.length > 8 ? device.name.substring(0, 8) + '...' : device.name,
        eventos: deviceEvents.length,
      };
    }).sort((a, b) => b.eventos - a.eventos).slice(0, 5); // Top 5 dispositivos

    setChartData({
      timeChart: locationStats,
      deviceChart: deviceStats,
    });

    // Análisis de dispositivos
    const deviceAnalysisData = devices.map(device => {
      const deviceEvents = events.filter(event => event.device_id === device.id);
      const lastEvent = deviceEvents
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
      
      return {
        device_name: device.name,
        total_events: deviceEvents.length,
        last_event: lastEvent?.created_at || 'N/A',
      };
    });

    setDeviceAnalysis(deviceAnalysisData);
  }, [events, devices, locations]);

  return {
    metrics,
    chartData,
    deviceAnalysis,
    isLoading,
  };
};
