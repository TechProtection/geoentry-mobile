import { useState, useEffect, useCallback } from 'react';
import { apiService, Sensor, CreateSensorData } from '../services/apiService';
import { Alert } from 'react-native';
import { useUserProximityStatus } from './useUserProximityStatus';

export const useSensors = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hook para verificar si el usuario está en casa
  const proximityStatus = useUserProximityStatus();

  const loadSensors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sensorsData = await apiService.getSensorsByUser();
      setSensors(sensorsData);
    } catch (err: any) {
      console.error('Error loading sensors:', err);
      setError(err.message || 'Error al cargar sensores');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSensor = useCallback(async (sensorData: CreateSensorData): Promise<Sensor | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const newSensor = await apiService.createSensorForUser(sensorData);
      
      // Actualizar la lista local
      setSensors(prev => [...prev, newSensor]);
      
      return newSensor;
    } catch (err: any) {
      console.error('Error creating sensor:', err);
      setError(err.message || 'Error al crear sensor');
      Alert.alert('Error', 'No se pudo crear el sensor');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSensorStatus = useCallback(async (sensorId: string, isActive: boolean): Promise<boolean> => {
    // 🔒 VERIFICAR SI EL USUARIO ESTÁ EN CASA
    if (!proximityStatus.isAtHome) {
      Alert.alert(
        '🏠 Control Bloqueado', 
        'Solo puedes controlar los sensores cuando estés en casa. Tu último estado registrado es "fuera de casa".',
        [
          { 
            text: 'Entendido', 
            style: 'default' 
          },
          { 
            text: 'Refrescar Estado', 
            onPress: () => proximityStatus.refresh(),
            style: 'default'
          }
        ]
      );
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      await apiService.updateSensorStatus(sensorId, isActive);
      
      // Actualizar el estado local
      setSensors(prev => prev.map(sensor => 
        sensor.id === sensorId ? { ...sensor, isActive } : sensor
      ));
      
      return true;
    } catch (err: any) {
      console.error('Error updating sensor status:', err);
      setError(err.message || 'Error al actualizar sensor');
      Alert.alert('Error', 'No se pudo actualizar el estado del sensor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [proximityStatus.isAtHome, proximityStatus.refresh]);

  const deleteSensor = useCallback(async (sensorId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await apiService.deleteSensor(sensorId);
      
      // Actualizar la lista local
      setSensors(prev => prev.filter(sensor => sensor.id !== sensorId));
      
      return true;
    } catch (err: any) {
      console.error('Error deleting sensor:', err);
      setError(err.message || 'Error al eliminar sensor');
      Alert.alert('Error', 'No se pudo eliminar el sensor');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSensorsByType = useCallback((type: 'led_tv' | 'smart_light' | 'air_conditioner' | 'coffee_maker') => {
    return sensors.filter(sensor => sensor.sensor_type === type);
  }, [sensors]);

  const getTVSensors = useCallback(() => getSensorsByType('led_tv'), [getSensorsByType]);
  const getLightSensors = useCallback(() => getSensorsByType('smart_light'), [getSensorsByType]);
  const getACSensors = useCallback(() => getSensorsByType('air_conditioner'), [getSensorsByType]);
  const getCoffeeMakerSensors = useCallback(() => getSensorsByType('coffee_maker'), [getSensorsByType]);

  useEffect(() => {
    loadSensors();
  }, [loadSensors]);

  return {
    sensors,
    loading,
    error,
    loadSensors,
    createSensor,
    updateSensorStatus,
    deleteSensor,
    getSensorsByType,
    getTVSensors,
    getLightSensors,
    getACSensors,
    getCoffeeMakerSensors,
    // Estados de proximidad
    proximityStatus,
    isControlsEnabled: proximityStatus.isAtHome,
  };
};
