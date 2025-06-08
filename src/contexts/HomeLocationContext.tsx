import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HomeLocation,
  ProximitySettings,
  LocationHistoryEntry,
  ProximityDetectionState,
  DEFAULT_PROXIMITY_SETTINGS,
} from '../types/location';

interface HomeLocationState {
  homeLocations: HomeLocation[];
  proximitySettings: ProximitySettings;
  locationHistory: LocationHistoryEntry[];
  detectionState: ProximityDetectionState;
  isLoading: boolean;
  error: string | null;
}

type HomeLocationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_HOME_LOCATIONS'; payload: HomeLocation[] }
  | { type: 'ADD_HOME_LOCATION'; payload: HomeLocation }
  | { type: 'UPDATE_HOME_LOCATION'; payload: { id: string; updates: Partial<HomeLocation> } }
  | { type: 'DELETE_HOME_LOCATION'; payload: string }
  | { type: 'SET_PROXIMITY_SETTINGS'; payload: ProximitySettings }
  | { type: 'ADD_HISTORY_ENTRY'; payload: LocationHistoryEntry }
  | { type: 'SET_DETECTION_STATE'; payload: Partial<ProximityDetectionState> }
  | { type: 'CLEAR_HISTORY' };

const initialState: HomeLocationState = {
  homeLocations: [],
  proximitySettings: DEFAULT_PROXIMITY_SETTINGS,
  locationHistory: [],
  detectionState: {
    isNearHome: false,
    currentDistance: null,
    nearestHomeLocation: null,
    lastDetectionTime: null,
    modalShownForCurrentSession: false,
  },
  isLoading: false,
  error: null,
};

const HomeLocationContext = createContext<{
  state: HomeLocationState;
  dispatch: React.Dispatch<HomeLocationAction>;
  saveHomeLocation: (location: Omit<HomeLocation, 'id' | 'createdAt'>) => Promise<void>;
  updateHomeLocation: (id: string, updates: Partial<HomeLocation>) => Promise<void>;
  deleteHomeLocation: (id: string) => Promise<void>;
  updateProximitySettings: (settings: Partial<ProximitySettings>) => Promise<void>;
  addHistoryEntry: (entry: Omit<LocationHistoryEntry, 'id' | 'timestamp'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadData: () => Promise<void>;
} | null>(null);

function homeLocationReducer(state: HomeLocationState, action: HomeLocationAction): HomeLocationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_HOME_LOCATIONS':
      return { ...state, homeLocations: action.payload };
    case 'ADD_HOME_LOCATION':
      return { ...state, homeLocations: [...state.homeLocations, action.payload] };
    case 'UPDATE_HOME_LOCATION':
      return {
        ...state,
        homeLocations: state.homeLocations.map(location =>
          location.id === action.payload.id
            ? { ...location, ...action.payload.updates }
            : location
        ),
      };
    case 'DELETE_HOME_LOCATION':
      return {
        ...state,
        homeLocations: state.homeLocations.filter(location => location.id !== action.payload),
      };
    case 'SET_PROXIMITY_SETTINGS':
      return { ...state, proximitySettings: action.payload };
    case 'ADD_HISTORY_ENTRY':
      return {
        ...state,
        locationHistory: [action.payload, ...state.locationHistory].slice(0, 100), // Keep last 100 entries
      };
    case 'SET_DETECTION_STATE':
      return {
        ...state,
        detectionState: { ...state.detectionState, ...action.payload },
      };
    case 'CLEAR_HISTORY':
      return { ...state, locationHistory: [] };
    default:
      return state;
  }
}

// Storage keys
const STORAGE_KEYS = {
  HOME_LOCATIONS: '@geoentry_home_locations',
  PROXIMITY_SETTINGS: '@geoentry_proximity_settings',
  LOCATION_HISTORY: '@geoentry_location_history',
};

export const HomeLocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(homeLocationReducer, initialState);

  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Load home locations
      const homeLocationsData = await AsyncStorage.getItem(STORAGE_KEYS.HOME_LOCATIONS);
      if (homeLocationsData) {
        const homeLocations = JSON.parse(homeLocationsData);
        dispatch({ type: 'SET_HOME_LOCATIONS', payload: homeLocations });
      }

      // Load proximity settings
      const proximitySettingsData = await AsyncStorage.getItem(STORAGE_KEYS.PROXIMITY_SETTINGS);
      if (proximitySettingsData) {
        const proximitySettings = JSON.parse(proximitySettingsData);
        dispatch({ type: 'SET_PROXIMITY_SETTINGS', payload: proximitySettings });
      }

      // Load location history
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_HISTORY);
      if (historyData) {
        const history = JSON.parse(historyData);
        dispatch({ type: 'ADD_HISTORY_ENTRY', payload: history[0] }); // Add first entry to initialize
        // Add rest of the entries
        history.slice(1).forEach((entry: LocationHistoryEntry) => {
          dispatch({ type: 'ADD_HISTORY_ENTRY', payload: entry });
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los datos' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveHomeLocation = async (locationData: Omit<HomeLocation, 'id' | 'createdAt'>) => {
    try {
      const newLocation: HomeLocation = {
        ...locationData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_HOME_LOCATION', payload: newLocation });
      
      const updatedLocations = [...state.homeLocations, newLocation];
      await AsyncStorage.setItem(STORAGE_KEYS.HOME_LOCATIONS, JSON.stringify(updatedLocations));
    } catch (error) {
      console.error('Error saving home location:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al guardar la ubicación' });
    }
  };

  const updateHomeLocation = async (id: string, updates: Partial<HomeLocation>) => {
    try {
      dispatch({ type: 'UPDATE_HOME_LOCATION', payload: { id, updates } });
      
      const updatedLocations = state.homeLocations.map(location =>
        location.id === id ? { ...location, ...updates } : location
      );
      await AsyncStorage.setItem(STORAGE_KEYS.HOME_LOCATIONS, JSON.stringify(updatedLocations));
    } catch (error) {
      console.error('Error updating home location:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al actualizar la ubicación' });
    }
  };

  const deleteHomeLocation = async (id: string) => {
    try {
      dispatch({ type: 'DELETE_HOME_LOCATION', payload: id });
      
      const filteredLocations = state.homeLocations.filter(location => location.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.HOME_LOCATIONS, JSON.stringify(filteredLocations));
      
      // Also remove related history entries
      const filteredHistory = state.locationHistory.filter(entry => entry.homeLocationId !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error deleting home location:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al eliminar la ubicación' });
    }
  };

  const updateProximitySettings = async (settingsUpdates: Partial<ProximitySettings>) => {
    try {
      const newSettings = { ...state.proximitySettings, ...settingsUpdates };
      dispatch({ type: 'SET_PROXIMITY_SETTINGS', payload: newSettings });
      await AsyncStorage.setItem(STORAGE_KEYS.PROXIMITY_SETTINGS, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error updating proximity settings:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al actualizar la configuración' });
    }
  };

  const addHistoryEntry = async (entryData: Omit<LocationHistoryEntry, 'id' | 'timestamp'>) => {
    try {
      const newEntry: LocationHistoryEntry = {
        ...entryData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_HISTORY_ENTRY', payload: newEntry });
      
      const updatedHistory = [newEntry, ...state.locationHistory].slice(0, 100);
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error adding history entry:', error);
    }
  };

  const clearHistory = async () => {
    try {
      dispatch({ type: 'CLEAR_HISTORY' });
      await AsyncStorage.removeItem(STORAGE_KEYS.LOCATION_HISTORY);
    } catch (error) {
      console.error('Error clearing history:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al limpiar el historial' });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const value = {
    state,
    dispatch,
    saveHomeLocation,
    updateHomeLocation,
    deleteHomeLocation,
    updateProximitySettings,
    addHistoryEntry,
    clearHistory,
    loadData,
  };

  return (
    <HomeLocationContext.Provider value={value}>
      {children}
    </HomeLocationContext.Provider>
  );
};

export const useHomeLocation = () => {
  const context = useContext(HomeLocationContext);
  if (!context) {
    throw new Error('useHomeLocation must be used within a HomeLocationProvider');
  }
  return context;
};
