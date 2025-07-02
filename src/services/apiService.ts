import { HomeLocation } from '../types/location';
import { Database } from '../types/supabase';
import { supabase } from '../supabase/supabase-client';

//const API_BASE_URL = 'https://geoentry-rest-api.onrender.com/api';
const API_BASE_URL = 'http://192.168.18.59:3000/api';

// Tipos basados en la estructura de Supabase
type LocationRow = Database['public']['Tables']['locations']['Row'];
type LocationInsert = Database['public']['Tables']['locations']['Insert'];
type ProximityEventInsert = Database['public']['Tables']['proximity_events']['Insert'];

export interface ApiHomeLocation {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  address?: string;
  is_active: boolean;
  profile_id: string;
  created_at?: string;
}

export interface ProximityEvent {
  type: 'enter' | 'exit';
  homeLocationId: string;
  homeLocationName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  timestamp: string;
  deviceId?: string;
  userId?: string;
}

// Tipo que coincide exactamente con la estructura de Supabase
export interface BackendProximityEvent {
  type: string; // 'enter' | 'exit'
  home_location_id: string;
  home_location_name: string;
  latitude: number;
  longitude: number;
  distance: number;
  device_id?: string | null;
  user_id?: string | null;
  created_at?: string | null;
}

class ApiService {
  private proximityEventEndpoint = '/proximity-events';
  
  setProximityEventEndpoint(endpoint: string) {
    this.proximityEventEndpoint = endpoint;
  }

  // Obtener el usuario actual de Supabase
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('Making API request to:', url);
      console.log('Request options:', options);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`API Error: ${response.status} - ${response.statusText}. Response: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      if (!responseText) {
        return {} as T;
      }

      try {
        const data = JSON.parse(responseText);
        return data;
      } catch (parseError) {
        console.error('JSON parse error. Raw response:', responseText);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Guardar una nueva ubicación
  async saveLocation(location: Omit<HomeLocation, 'id' | 'createdAt'>): Promise<HomeLocation> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const apiLocation: Omit<ApiHomeLocation, 'id' | 'created_at'> = {
      name: location.name,
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      radius: location.radius,
      address: location.address || '',
      is_active: location.isActive,
      profile_id: userId,
    };

    console.log('Sending location data to API:', apiLocation);

    const result = await this.makeRequest<ApiHomeLocation>('/locations', {
      method: 'POST',
      body: JSON.stringify(apiLocation),
    });

    // Convertir la respuesta de la API al formato interno
    return {
      id: result.id || Date.now().toString(),
      name: result.name,
      coordinates: {
        latitude: result.latitude,
        longitude: result.longitude,
      },
      radius: result.radius,
      address: result.address || '',
      isActive: result.is_active,
      createdAt: result.created_at || new Date().toISOString(),
    };
  }

  // Obtener todas las ubicaciones
  async getLocations(): Promise<HomeLocation[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.log('User not authenticated, returning empty array');
        return [];
      }

      // Obtener solo las ubicaciones del usuario actual
      const result = await this.makeRequest<ApiHomeLocation[]>(`/locations?profile_id=${userId}`);
      
      // Convertir la respuesta de la API al formato interno
      return result.map(apiLocation => ({
        id: apiLocation.id || Date.now().toString(),
        name: apiLocation.name,
        coordinates: {
          latitude: apiLocation.latitude,
          longitude: apiLocation.longitude,
        },
        radius: apiLocation.radius,
        address: apiLocation.address || '',
        isActive: apiLocation.is_active,
        createdAt: apiLocation.created_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.log('Error fetching locations from API, returning empty array:', error);
      return [];
    }
  }

  // Actualizar una ubicación
  async updateLocation(id: string, updates: Partial<HomeLocation>): Promise<HomeLocation> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const apiUpdates: Partial<ApiHomeLocation> = {
      name: updates.name,
      latitude: updates.coordinates?.latitude,
      longitude: updates.coordinates?.longitude,
      radius: updates.radius,
      address: updates.address,
      is_active: updates.isActive,
      profile_id: userId, // Asegurar que siempre se incluya el user_id
    };

    console.log('Sending location update to API:', apiUpdates);

    const result = await this.makeRequest<ApiHomeLocation>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiUpdates),
    });

    return {
      id: result.id || id,
      name: result.name,
      coordinates: {
        latitude: result.latitude,
        longitude: result.longitude,
      },
      radius: result.radius,
      address: result.address || '',
      isActive: result.is_active,
      createdAt: result.created_at || new Date().toISOString(),
    };
  }

  // Eliminar una ubicación
  async deleteLocation(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await this.makeRequest(`/locations/${id}?profile_id=${userId}`, {
      method: 'DELETE',
    });
  }

  // Enviar evento de proximidad
  async sendProximityEvent(event: ProximityEvent): Promise<void> {
    try {
      console.log('Sending proximity event to API:', event);
      
      // Verificar salud de la API primero
      const isApiHealthy = await this.checkApiHealth();
      if (!isApiHealthy) {
        console.warn('API is not healthy, skipping proximity event send');
        return;
      }

      // Obtener el user_id actual
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.error('User not authenticated, cannot send proximity event');
        return;
      }
      
      // Formatear el evento para que coincida exactamente con la estructura de Supabase
      const formattedEvent: BackendProximityEvent = {
        type: event.type,
        home_location_id: event.homeLocationId,
        home_location_name: event.homeLocationName,
        latitude: event.coordinates.latitude,
        longitude: event.coordinates.longitude,
        distance: event.distance,
        device_id: event.deviceId || null,
        user_id: userId, // Usar el user_id actual del usuario autenticado
        created_at: new Date().toISOString(),
      };
      
      console.log('Formatted event for backend:', formattedEvent);
        
      // Intentar diferentes endpoints
      const possibleEndpoints = [
        this.proximityEventEndpoint, 
        '/proximity-events',
        '/proximity_events', // snake_case variant
      ];
      
      const uniqueEndpoints = [...new Set(possibleEndpoints)];
      let success = false;
      let lastError: Error | null = null;
      
      for (const endpoint of uniqueEndpoints) {
        try {
          console.log(`Trying proximity event endpoint: ${endpoint}`);
          await this.makeRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(formattedEvent),
          });
          console.log(`Proximity event sent successfully via ${endpoint}:`, event.type);
          success = true;
          break;
        } catch (endpointError) {
          console.log(`Endpoint ${endpoint} failed:`, endpointError);
          lastError = endpointError as Error;
          continue;
        }
      }
      
      if (!success) {
        throw lastError || new Error('All proximity event endpoints failed');
      }
      
    } catch (error) {
      console.error('Failed to send proximity event to API:', error);
      console.log('Event details that failed to send:', {
        type: event.type,
        homeLocationId: event.homeLocationId,
        timestamp: event.timestamp,
        coordinates: event.coordinates,
        userId: await this.getCurrentUserId(),
      });
      // No lanzar error para no interrumpir la funcionalidad local
    }
  }

  // Verificar si la API está disponible
  async checkApiHealth(): Promise<boolean> {
    try {
      console.log('Checking API health...');
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      
      console.log('API health check status:', response.status);
      return response.status === 200;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
