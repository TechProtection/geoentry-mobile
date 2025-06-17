import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      // Get or create device ID
      let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      const fallbackDeviceId = `fallback_${Date.now()}`;
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
      const deviceInfo = await this.initializeDeviceInfo();
      
      // Get or create user ID
      let userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      const fallbackUserId = `fallback_user_${Date.now()}`;
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
}

export const deviceService = new DeviceService();
export type { DeviceInfo, UserInfo };
