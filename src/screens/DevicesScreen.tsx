import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useDevices, useDeviceStats } from '../hooks/useDevices';
import { useEvents } from '../hooks/useEvents';
import { useCurrentUser } from '../hooks/useCurrentUser';

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <View style={tw`bg-gray-800 rounded-lg p-4 flex-1 mx-1`}>
    <View style={tw`flex-row items-center justify-between`}>
      <View style={tw`flex-1`}>
        <Text style={tw`text-gray-400 text-sm font-medium`}>{title}</Text>
        <Text style={tw`text-white text-2xl font-bold mt-1`}>{value}</Text>
      </View>
      <View style={[tw`p-2 rounded-full`, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
    </View>
  </View>
);

interface DeviceCardProps {
  device: any;
  eventCounts: {
    total: number;
    today: number;
  };
  userProfile: any;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, eventCounts, userProfile }) => (
  <View style={tw`bg-gray-800 rounded-lg p-5 mb-4`}>
    <View style={tw`flex-row items-start`}>
      <View style={tw`bg-blue-600 rounded-lg w-12 h-12 items-center justify-center mr-4`}>
        <MaterialIcons name="smartphone" size={24} color="white" />
      </View>
      
      <View style={tw`flex-1`}>
        <Text style={tw`text-white text-lg font-semibold mb-3`}>{device.name}</Text>
        
        <View style={tw`flex-row mb-3`}>
          <View style={tw`flex-1 mr-4`}>
            <Text style={tw`text-gray-400 text-sm`}>Tipo:</Text>
            <Text style={tw`text-white`}>{device.type}</Text>
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-gray-400 text-sm`}>Usuario:</Text>
            <Text style={tw`text-white`}>{userProfile?.full_name || 'N/A'}</Text>
          </View>
        </View>
        
        <Text style={tw`text-gray-400 text-sm mb-4`}>
          Email: {userProfile?.email || 'N/A'}
        </Text>
        
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`items-center`}>
            <Text style={tw`text-blue-400 text-xl font-bold`}>{eventCounts.total}</Text>
            <Text style={tw`text-gray-400 text-xs`}>Total Eventos</Text>
          </View>
          <View style={tw`items-center`}>
            <Text style={tw`text-green-400 text-xl font-bold`}>{eventCounts.today}</Text>
            <Text style={tw`text-gray-400 text-xs`}>Hoy</Text>
          </View>
          <View style={tw`items-center`}>
            <View style={tw`bg-green-600 px-3 py-1 rounded`}>
              <Text style={tw`text-white text-sm`}>Activo</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  </View>
);

const DevicesScreen: React.FC = () => {
  const { devices, loading: devicesLoading, error: devicesError, refetch: refetchDevices } = useDevices();
  const { events, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEvents();
  const { profile: userProfile, loading: profileLoading } = useCurrentUser();
  const stats = useDeviceStats(devices, events);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loading = devicesLoading || eventsLoading || profileLoading;
  const error = devicesError || eventsError;

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (userProfile?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventCounts = (deviceId: string) => {
    const deviceEvents = events.filter(event => event.device_id === deviceId);
    const today = new Date().toDateString();
    const todayEvents = deviceEvents.filter(event => {
      if (!event.created_at) return false;
      return new Date(event.created_at).toDateString() === today;
    });

    return {
      total: deviceEvents.length,
      today: todayEvents.length,
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchDevices(), refetchEvents()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const statsCards = [
    { 
      title: 'Total Dispositivos', 
      value: stats.totalDevices.toString(), 
      icon: 'smartphone' as keyof typeof MaterialIcons.glyphMap, 
      color: '#60a5fa' 
    },
    { 
      title: 'Dispositivos Activos', 
      value: stats.activeDevices.toString(), 
      icon: 'check-circle' as keyof typeof MaterialIcons.glyphMap, 
      color: '#4ade80' 
    },
    { 
      title: 'Fuera de Zona', 
      value: stats.devicesOutOfZone.toString(), 
      icon: 'location-off' as keyof typeof MaterialIcons.glyphMap, 
      color: '#f87171' 
    },
    { 
      title: 'Sin Actividad', 
      value: stats.inactiveDevices.toString(), 
      icon: 'pause-circle-outline' as keyof typeof MaterialIcons.glyphMap, 
      color: '#9ca3af' 
    },
  ];

  if (loading && !refreshing) {
    return (
      <View style={tw`flex-1 bg-gray-900 items-center justify-center`}>
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text style={tw`text-white mt-4`}>Cargando dispositivos...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={tw`flex-1 bg-gray-900 items-center justify-center px-6`}>
        <MaterialIcons name="error-outline" size={48} color="#f87171" />
        <Text style={tw`text-red-400 text-center mt-4`}>
          Error al cargar dispositivos: {error}
        </Text>
        <Pressable
          style={tw`bg-blue-600 px-6 py-3 rounded-lg mt-4`}
          onPress={onRefresh}
        >
          <Text style={tw`text-white font-medium`}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-4 pb-8`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#60a5fa"
            colors={['#60a5fa']}
          />
        }
      >
        {/* Header */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-white text-2xl font-bold`}>Dispositivos</Text>
          <Text style={tw`text-gray-400 mt-1`}>
            Gestiona todos los dispositivos registrados en el sistema
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row mb-3`}>
            <StatCard {...statsCards[0]} />
            <StatCard {...statsCards[1]} />
          </View>
        </View>

        {/* Device List */}
        {filteredDevices.length === 0 ? (
          <View style={tw`items-center py-8`}>
            <MaterialIcons name="smartphone" size={48} color="#9ca3af" />
            <Text style={tw`text-gray-400 text-center mt-4`}>
              {devices.length === 0 
                ? 'No tienes dispositivos registrados' 
                : 'No se encontraron dispositivos'}
            </Text>
          </View>
        ) : (
          filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              eventCounts={getEventCounts(device.id)}
              userProfile={userProfile}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default DevicesScreen;