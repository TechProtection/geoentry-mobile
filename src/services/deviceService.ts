import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: string;
  osVersion: string;
  appVersion: string;
}

interface UserInfo {
  userId: string;
  deviceId: string;
}

const STORAGE_KEYS = {
  DEVICE_ID: '@geoentry_device_id',
  USER_ID: '@geoentry_user_id',
};

class DeviceService {
  private deviceInfo: DeviceInfo | null = null;
  private userInfo: UserInfo | null = null;

  async initializeDeviceInfo(): Promise<DeviceInfo> {
    if (this.deviceInfo) {
      return this.deviceInfo;
    }

    try {
      // Verificar y migrar IDs antiguos a UUIDs válidos
      await this.ensureValidUUIDs();
      
      // Get or create device ID
      let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = uuid.v4() as string;
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      }

      this.deviceInfo = {
        deviceId,
        deviceName: Device.deviceName || 'Unknown Device',
        platform: Platform.OS,
        osVersion: Device.osVersion || 'Unknown',
        appVersion: '1.0.0', // This could be retrieved from app.json or package.json
      };

      return this.deviceInfo;
    } catch (error) {
      console.error('Error initializing device info:', error);
      // Fallback device info
      const fallbackDeviceId = uuid.v4() as string;
      this.deviceInfo = {
        deviceId: fallbackDeviceId,
        deviceName: 'Unknown Device',
        platform: Platform.OS,
        osVersion: 'Unknown',
        appVersion: '1.0.0',
      };
      return this.deviceInfo;
    }
  }

  async initializeUserInfo(): Promise<UserInfo> {
    if (this.userInfo) {
      return this.userInfo;
    }

    try {
      // Verificar y migrar IDs antiguos a UUIDs válidos
      await this.ensureValidUUIDs();
      
      const deviceInfo = await this.initializeDeviceInfo();
      
      // Get or create user ID
      let userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        userId = uuid.v4() as string;
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      }

      this.userInfo = {
        userId,
        deviceId: deviceInfo.deviceId,
      };

      return this.userInfo;
    } catch (error) {
      console.error('Error initializing user info:', error);
      // Fallback user info
      const fallbackUserId = uuid.v4() as string;
      this.userInfo = {
        userId: fallbackUserId,
        deviceId: 'unknown_device',
      };
      return this.userInfo;
    }
  }

  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  getUserInfo(): UserInfo | null {
    return this.userInfo;
  }

  async getDeviceId(): Promise<string> {
    const deviceInfo = await this.initializeDeviceInfo();
    return deviceInfo.deviceId;
  }

  async getUserId(): Promise<string> {
    const userInfo = await this.initializeUserInfo();
    return userInfo.userId;
  }

  // Método para limpiar IDs antiguos y regenerar UUIDs válidos
  async clearAndRegenerateIds(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_ID);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
      this.deviceInfo = null;
      this.userInfo = null;
      console.log('Cleared old IDs, will regenerate UUID-based IDs');
    } catch (error) {
      console.error('Error clearing old IDs:', error);
    }
  }

  // Método para verificar si los IDs actuales son UUIDs válidos
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Método para verificar y migrar IDs antiguos a UUIDs
  async ensureValidUUIDs(): Promise<void> {
    try {
      const currentDeviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      const currentUserId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      
      let needsUpdate = false;
      
      if (currentDeviceId && !this.isValidUUID(currentDeviceId)) {
        console.log('Device ID is not a valid UUID, regenerating...');
        await AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_ID);
        needsUpdate = true;
      }
      
      if (currentUserId && !this.isValidUUID(currentUserId)) {
        console.log('User ID is not a valid UUID, regenerating...');
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        this.deviceInfo = null;
        this.userInfo = null;
        console.log('Old non-UUID IDs cleared, will generate new UUIDs');
      }
    } catch (error) {
      console.error('Error ensuring valid UUIDs:', error);
    }
  }
}

export const deviceService = new DeviceService();
export type { DeviceInfo, UserInfo };
