import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useHomeLocation } from '../contexts/HomeLocationContext';
import { Coordinates, HomeLocation, ProximityDetectionState } from '../types/location';

interface UseProximityDetectionOptions {
  enableWatching?: boolean;
  watchInterval?: number; // in milliseconds
  minDistanceFilter?: number; // in meters
}

interface ProximityEvent {
  type: 'enter' | 'exit';
  homeLocation: HomeLocation;
  distance: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in meters
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Find the nearest home location to current coordinates
 * @param currentLocation Current coordinates
 * @param homeLocations Array of home locations
 * @returns Object with nearest location and distance, or null if none found
 */
export const findNearestHomeLocation = (
  currentLocation: Coordinates,
  homeLocations: HomeLocation[]
): { location: HomeLocation; distance: number } | null => {
  if (homeLocations.length === 0) return null;

  const activeLocations = homeLocations.filter(loc => loc.isActive);
  if (activeLocations.length === 0) return null;

  let nearest: { location: HomeLocation; distance: number } | null = null;

  for (const homeLocation of activeLocations) {
    const distance = calculateDistance(currentLocation, homeLocation.coordinates);
    
    if (!nearest || distance < nearest.distance) {
      nearest = { location: homeLocation, distance };
    }
  }

  return nearest;
};

/**
 * Check if current location is within proximity of any home location
 * @param currentLocation Current coordinates
 * @param homeLocations Array of home locations
 * @returns Object with proximity status and details
 */
export const checkProximity = (
  currentLocation: Coordinates,
  homeLocations: HomeLocation[]
): {
  isNearHome: boolean;
  nearestLocation: HomeLocation | null;
  distance: number | null;
  withinRadius: boolean;
} => {
  const nearest = findNearestHomeLocation(currentLocation, homeLocations);
  
  if (!nearest) {
    return {
      isNearHome: false,
      nearestLocation: null,
      distance: null,
      withinRadius: false,
    };
  }

  const withinRadius = nearest.distance <= nearest.location.radius;

  return {
    isNearHome: withinRadius,
    nearestLocation: nearest.location,
    distance: nearest.distance,
    withinRadius,
  };
};

export const useProximityDetection = (options: UseProximityDetectionOptions = {}) => {
  const {
    enableWatching = false,
    watchInterval = 5000,
    minDistanceFilter = 10,
  } = options;

  const { state, dispatch, addHistoryEntry } = useHomeLocation();
  const { homeLocations, proximitySettings, detectionState } = state;

  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastProximityCheck, setLastProximityCheck] = useState<Date | null>(null);

  const watchSubscription = useRef<Location.LocationSubscription | null>(null);
  const proximityCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const lastKnownProximityState = useRef<boolean>(false);
  // Proximity event callbacks
  const onProximityEnter = useCallback(async (event: ProximityEvent) => {
    console.log('Proximity Enter:', event);
    
    // Add history entry
    await addHistoryEntry({
      homeLocationId: event.homeLocation.id,
      eventType: 'enter',
      distance: event.distance,
    });

    // Update detection state - reset modal shown flag on new entry
    dispatch({
      type: 'SET_DETECTION_STATE',
      payload: {
        isNearHome: true,
        nearestHomeLocation: event.homeLocation,
        currentDistance: event.distance,
        lastDetectionTime: new Date().toISOString(),
        modalShownForCurrentSession: false, // Reset to allow modal to show again
      },
    });
  }, [addHistoryEntry, dispatch]);
  const onProximityExit = useCallback(async (event: ProximityEvent) => {
    console.log('Proximity Exit:', event);
    
    // Add history entry
    await addHistoryEntry({
      homeLocationId: event.homeLocation.id,
      eventType: 'exit',
      distance: event.distance,
    });

    // Update detection state - reset modal shown flag when exiting
    dispatch({
      type: 'SET_DETECTION_STATE',
      payload: {
        isNearHome: false,
        nearestHomeLocation: event.homeLocation,
        currentDistance: event.distance,
        lastDetectionTime: new Date().toISOString(),
        modalShownForCurrentSession: false, // Reset for next time they enter
      },
    });
  }, [addHistoryEntry, dispatch]);

  // Check proximity for current location
  const checkCurrentProximity = useCallback(
    (location: Coordinates) => {
      if (!proximitySettings.isEnabled || homeLocations.length === 0) {
        return;
      }

      const proximityResult = checkProximity(location, homeLocations);
      
      // Update current distance in state
      dispatch({
        type: 'SET_DETECTION_STATE',
        payload: {
          currentDistance: proximityResult.distance,
          nearestHomeLocation: proximityResult.nearestLocation,
        },
      });

      // Check for proximity changes
      const wasNearHome = lastKnownProximityState.current;
      const isNowNearHome = proximityResult.isNearHome;

      if (!wasNearHome && isNowNearHome && proximityResult.nearestLocation) {
        // Entered proximity
        onProximityEnter({
          type: 'enter',
          homeLocation: proximityResult.nearestLocation,
          distance: proximityResult.distance || 0,
        });
      } else if (wasNearHome && !isNowNearHome && proximityResult.nearestLocation) {
        // Exited proximity
        onProximityExit({
          type: 'exit',
          homeLocation: proximityResult.nearestLocation,
          distance: proximityResult.distance || 0,
        });
      }

      lastKnownProximityState.current = isNowNearHome;
      setLastProximityCheck(new Date());
    },
    [homeLocations, proximitySettings.isEnabled, onProximityEnter, onProximityExit, dispatch]
  );

  // Get current location once
  const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    try {
      setError(null);

      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        throw new Error('Permisos de ubicación no concedidos');
      }

      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw new Error('Servicios de ubicación desactivados');
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const coordinates: Coordinates = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };

      setCurrentLocation(coordinates);
      checkCurrentProximity(coordinates);
      
      return coordinates;
    } catch (err: any) {
      console.error('Error getting current location:', err);
      setError(err.message || 'Error al obtener la ubicación');
      return null;
    }
  }, [checkCurrentProximity]);

  // Start watching location
  const startWatching = useCallback(async () => {
    try {
      if (isWatching || !proximitySettings.isEnabled) return;

      setError(null);

      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        throw new Error('Permisos de ubicación no concedidos');
      }

      // Stop any existing subscription
      if (watchSubscription.current) {
        watchSubscription.current.remove();
      }

      // Start watching position
      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: watchInterval,
          distanceInterval: minDistanceFilter,
        },
        (locationResult) => {
          const coordinates: Coordinates = {
            latitude: locationResult.coords.latitude,
            longitude: locationResult.coords.longitude,
          };

          setCurrentLocation(coordinates);
          checkCurrentProximity(coordinates);
        }
      );

      setIsWatching(true);
      console.log('Proximity watching started');
    } catch (err: any) {
      console.error('Error starting location watching:', err);
      setError(err.message || 'Error al iniciar el monitoreo');
    }
  }, [isWatching, proximitySettings.isEnabled, watchInterval, minDistanceFilter, checkCurrentProximity]);

  // Stop watching location
  const stopWatching = useCallback(() => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }

    if (proximityCheckInterval.current) {
      clearInterval(proximityCheckInterval.current);
      proximityCheckInterval.current = null;
    }

    setIsWatching(false);
    console.log('Proximity watching stopped');
  }, []);

  // Force proximity check
  const forceProximityCheck = useCallback(async () => {
    const location = await getCurrentLocation();
    return location;
  }, [getCurrentLocation]);

  // Auto-start watching if enabled
  useEffect(() => {
    if (enableWatching && proximitySettings.isEnabled && !isWatching) {
      startWatching();
    } else if ((!enableWatching || !proximitySettings.isEnabled) && isWatching) {
      stopWatching();
    }
  }, [enableWatching, proximitySettings.isEnabled, isWatching, startWatching, stopWatching]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    // State
    currentLocation,
    isWatching,
    error,
    detectionState,
    lastProximityCheck,
    
    // Actions
    getCurrentLocation,
    startWatching,
    stopWatching,
    forceProximityCheck,
    
    // Utilities
    calculateDistance,
    findNearestHomeLocation,
    checkProximity,
  };
};
