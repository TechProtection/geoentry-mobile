import { HomeLocation } from '../types/location';

const API_BASE_URL = 'https://geoentry-prueba1.free.beeceptor.com/api';

export interface ApiHomeLocation {
  id?: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  address?: string;
  isActive: boolean;
  createdAt?: string;
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

class ApiService {
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
        return {} as T; // Return empty object for successful requests with no body
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
    const apiLocation: Omit<ApiHomeLocation, 'id' | 'createdAt'> = {
      name: location.name,
      coordinates: location.coordinates,
      radius: location.radius,
      address: location.address,
      isActive: location.isActive,
    };

    const result = await this.makeRequest<ApiHomeLocation>('/location', {
      method: 'POST',
      body: JSON.stringify(apiLocation),
    });

    // Convertir la respuesta de la API al formato interno
    return {
      id: result.id || Date.now().toString(),
      name: result.name,
      coordinates: result.coordinates,
      radius: result.radius,
      address: result.address || '',
      isActive: result.isActive,
      createdAt: result.createdAt || new Date().toISOString(),
    };
  }

  // Obtener todas las ubicaciones
  async getLocations(): Promise<HomeLocation[]> {
    try {
      const result = await this.makeRequest<ApiHomeLocation[]>('/location');
      
      // Convertir la respuesta de la API al formato interno
      return result.map(apiLocation => ({
        id: apiLocation.id || Date.now().toString(),
        name: apiLocation.name,
        coordinates: apiLocation.coordinates,
        radius: apiLocation.radius,
        address: apiLocation.address || '',
        isActive: apiLocation.isActive,
        createdAt: apiLocation.createdAt || new Date().toISOString(),
      }));
    } catch (error) {
      console.log('Error fetching locations from API, returning empty array:', error);
      return [];
    }
  }

  // Actualizar una ubicación
  async updateLocation(id: string, updates: Partial<HomeLocation>): Promise<HomeLocation> {
    const apiUpdates: Partial<ApiHomeLocation> = {
      name: updates.name,
      coordinates: updates.coordinates,
      radius: updates.radius,
      address: updates.address,
      isActive: updates.isActive,
    };

    const result = await this.makeRequest<ApiHomeLocation>(`/location/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiUpdates),
    });

    return {
      id: result.id || id,
      name: result.name,
      coordinates: result.coordinates,
      radius: result.radius,
      address: result.address || '',
      isActive: result.isActive,
      createdAt: result.createdAt || new Date().toISOString(),
    };
  }

  // Eliminar una ubicación
  async deleteLocation(id: string): Promise<void> {
    await this.makeRequest(`/location/${id}`, {
      method: 'DELETE',
    });
  }  // Enviar evento de proximidad
  async sendProximityEvent(event: ProximityEvent): Promise<void> {
    try {
      console.log('Sending proximity event to API:', event);
      
      // Check API health first
      const isApiHealthy = await this.checkApiHealth();
      if (!isApiHealthy) {
        console.warn('API is not healthy, skipping proximity event send');
        return;
      }
      
      // Try different endpoints that might work with Beeceptor
      const endpoints = ['/location'];
      let success = false;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          await this.makeRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(event),
          });
          console.log(`Proximity event sent to API successfully via ${endpoint}:`, event.type);
          success = true;
          break;
        } catch (endpointError) {
          console.log(`Endpoint ${endpoint} failed:`, endpointError);
          continue;
        }
      }
      
      if (!success) {
        throw new Error('All endpoints failed');
      }
      
    } catch (error) {
      console.error('Failed to send proximity event to API:', error);
      // Log the event details for debugging
      console.log('Event details that failed to send:', {
        type: event.type,
        homeLocationId: event.homeLocationId,
        timestamp: event.timestamp,
        url: `${API_BASE_URL}/proximity-event`,
      });
      // No throw error para no interrumpir la funcionalidad local
    }
  }
  // Verificar si la API está disponible
  async checkApiHealth(): Promise<boolean> {
    try {
      console.log('Checking API health...');
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
      });
      
      console.log('API health check status:', response.status);
      return response.status === 200 || response.status === 404; // 404 is also OK for this endpoint
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
