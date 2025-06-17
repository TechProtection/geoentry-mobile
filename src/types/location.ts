export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface HomeLocation {
  id: string;
  name: string;
  coordinates: Coordinates;
  radius: number; // in meters
  isActive: boolean;
  createdAt: string;
  address?: string;
}

export interface ProximitySettings {
  isEnabled: boolean;
  showNotifications: boolean;
  autoTriggerDevices: boolean;
  notificationSound: boolean;
  vibration: boolean;
}

export interface LocationHistoryEntry {
  id: string;
  homeLocationId: string;
  eventType: 'enter' | 'exit';
  timestamp: string;
  distance: number;
}

export interface ProximityDetectionState {
  isNearHome: boolean;
  currentDistance: number | null;
  nearestHomeLocation: HomeLocation | null;
  lastDetectionTime: string | null;
  modalShownForCurrentSession: boolean;
}

export const DEFAULT_PROXIMITY_SETTINGS: ProximitySettings = {
  isEnabled: true,
  showNotifications: true,
  autoTriggerDevices: false,
  notificationSound: true,
  vibration: true,
};

export const PROXIMITY_RADIUS_OPTIONS = [50, 100, 200, 500, 1000]; // in meters

export type ProximityModalState = 'hidden' | 'entering' | 'visible' | 'exiting';
