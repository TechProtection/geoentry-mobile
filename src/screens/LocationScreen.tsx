import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, ScrollView, Clipboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';

// Styled Components
const Container = styled.ScrollView`
  flex: 1;
  background-color: ${COLORS.background};
  padding: ${SPACING.lg}px;
`;

const StatusCard = styled.View`
  background-color: ${COLORS.secondary};
  border-radius: 12px;
  padding: ${SPACING.lg}px;
  margin-bottom: ${SPACING.lg}px;
  align-items: center;
`;

const StatusIcon = styled.View<{ status: 'loading' | 'success' | 'error' }>`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: ${({ status }: { status: 'loading' | 'success' | 'error' }) => 
    status === 'loading' ? COLORS.accent :
    status === 'success' ? '#4CAF50' :
    '#F44336'};
  align-items: center;
  justify-content: center;
  margin-bottom: ${SPACING.md}px;
`;

const StatusText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  text-align: center;
`;

const CoordinatesCard = styled.View`
  background-color: ${COLORS.secondary};
  border-radius: 12px;
  padding: ${SPACING.lg}px;
  margin-bottom: ${SPACING.lg}px;
`;

const CardTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: 600;
  margin-bottom: ${SPACING.md}px;
`;

const CoordinateRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.sm}px;
`;

const CoordinateLabel = styled.Text`
  color: ${COLORS.accent};
  font-size: ${TYPOGRAPHY.body}px;
`;

const CoordinateValue = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 500;
  flex: 1;
  text-align: right;
  margin-right: ${SPACING.sm}px;
`;

const AddressCard = styled.View`
  background-color: ${COLORS.secondary};
  border-radius: 12px;
  padding: ${SPACING.lg}px;
  margin-bottom: ${SPACING.lg}px;
`;

const AddressText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  line-height: 22px;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>`
  background-color: ${({ variant }: { variant?: 'primary' | 'secondary' }) => variant === 'secondary' ? COLORS.secondary : COLORS.accent};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  align-items: center;
  margin-bottom: ${SPACING.md}px;
  flex-direction: row;
  justify-content: center;
`;

const ButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>`
  color: ${({ variant }: { variant?: 'primary' | 'secondary' }) => variant === 'secondary' ? COLORS.textPrimary : COLORS.background};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  margin-left: ${SPACING.sm}px;
`;

const AccuracyIndicator = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${SPACING.sm}px;
`;

const AccuracyDot = styled.View<{ level: 'high' | 'medium' | 'low' }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({ level }: { level: 'high' | 'medium' | 'low' }) => 
    level === 'high' ? '#4CAF50' :
    level === 'medium' ? '#FF9800' :
    '#F44336'};
  margin-right: ${SPACING.xs}px;
`;

const AccuracyText = styled.Text`
  color: ${COLORS.accent};
  font-size: ${TYPOGRAPHY.small}px;
`;

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  timestamp: number;
}

interface AddressData {
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
}

type LocationStatus = 'idle' | 'loading' | 'success' | 'error';

const LocationScreen: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState<AddressData | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isWatching, setIsWatching] = useState(false);
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    checkLocationPermission();
    return () => {
      if (watchSubscription.current) {
        watchSubscription.current.remove();
      }
    };
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === Location.PermissionStatus.GRANTED) {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      setErrorMessage('Error al verificar permisos');
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === Location.PermissionStatus.GRANTED) {
        getCurrentLocation();
      } else if (status === Location.PermissionStatus.DENIED) {
        Alert.alert(
          'Permisos Necesarios',
          'Esta aplicación necesita acceso a tu ubicación para funcionar correctamente. Ve a Configuración para habilitarlo.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Ir a Configuración', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setErrorMessage('Error al solicitar permisos');
    }
  };

  const getCurrentLocation = async () => {
    try {      setStatus('loading');
      setErrorMessage('');

      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw new Error('Los servicios de ubicación están desactivados');
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const locationData: LocationData = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        accuracy: locationResult.coords.accuracy,
        altitude: locationResult.coords.altitude,
        speed: locationResult.coords.speed,
        timestamp: locationResult.timestamp,
      };

      setLocation(locationData);
      setStatus('success');
      
      // Get address
      await getAddressFromCoordinates(locationData.latitude, locationData.longitude);
      
    } catch (error: any) {
      console.error('Error getting location:', error);
      setStatus('error');
      
      if (error.code === 'E_LOCATION_TIMEOUT') {
        setErrorMessage('Tiempo de espera agotado. Intenta nuevamente.');
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        setErrorMessage('Ubicación no disponible. Verifica que el GPS esté activado.');
      } else {
        setErrorMessage(error.message || 'Error al obtener la ubicación');
      }
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const addressResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addressResult.length > 0) {
        const addr = addressResult[0];
        setAddress({
          street: `${addr.name || ''} ${addr.street || ''}`.trim(),
          city: addr.city || '',
          region: addr.region || '',
          country: addr.country || '',
          postalCode: addr.postalCode || '',
        });
      }
    } catch (error) {
      console.error('Error getting address:', error);
      // Don't show error for address, it's optional
    }
  };

  const startWatchingLocation = async () => {
    try {
      if (watchSubscription.current) {
        watchSubscription.current.remove();
      }

      setIsWatching(true);
      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (locationResult) => {
          const locationData: LocationData = {
            latitude: locationResult.coords.latitude,
            longitude: locationResult.coords.longitude,
            accuracy: locationResult.coords.accuracy,
            altitude: locationResult.coords.altitude,
            speed: locationResult.coords.speed,
            timestamp: locationResult.timestamp,
          };
          setLocation(locationData);
        }
      );
    } catch (error) {
      console.error('Error watching location:', error);
      setIsWatching(false);
    }
  };

  const stopWatchingLocation = () => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    setIsWatching(false);
  };

  const copyCoordinates = async () => {
    if (location) {
      const coords = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      await Clipboard.setString(coords);
      Alert.alert('Copiado', 'Coordenadas copiadas al portapapeles');
    }
  };

  const shareLocation = () => {
    if (location) {
      const coords = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      const url = `https://www.google.com/maps?q=${coords}`;
      
      Alert.alert(
        'Compartir Ubicación',
        `Coordenadas: ${coords}\n\nAbrir en Google Maps?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir', onPress: () => Linking.openURL(url) }
        ]
      );
    }
  };

  const getAccuracyLevel = (accuracy: number | null): 'high' | 'medium' | 'low' => {
    if (!accuracy) return 'low';
    if (accuracy <= 10) return 'high';
    if (accuracy <= 50) return 'medium';
    return 'low';
  };

  const getAccuracyText = (accuracy: number | null): string => {
    if (!accuracy) return 'Precisión desconocida';
    const level = getAccuracyLevel(accuracy);
    return `${accuracy.toFixed(1)}m - ${
      level === 'high' ? 'Excelente' :
      level === 'medium' ? 'Buena' : 'Baja'
    }`;
  };
  const getStatusInfo = () => {
    switch (status) {
      case 'loading':
        return {
          icon: 'gps-fixed' as const,
          text: 'Obteniendo ubicación...',
          status: 'loading' as const
        };
      case 'success':
        return {
          icon: 'location-on' as const,
          text: 'Ubicación obtenida',
          status: 'success' as const
        };
      case 'error':
        return {
          icon: 'location-off' as const,
          text: errorMessage || 'Error al obtener ubicación',
          status: 'error' as const
        };
      default:
        return {
          icon: 'location-searching' as const,
          text: 'Presiona para obtener ubicación',
          status: 'loading' as const
        };
    }
  };

  if (permissionStatus !== Location.PermissionStatus.GRANTED) {
    return (
      <Container contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
        <StatusCard>
          <StatusIcon status="error">
            <MaterialIcons name="location-disabled" size={30} color="white" />
          </StatusIcon>
          <StatusText>
            {permissionStatus === Location.PermissionStatus.DENIED
              ? 'Permisos de ubicación denegados'
              : 'Se necesitan permisos de ubicación'
            }
          </StatusText>
        </StatusCard>
        
        <ActionButton onPress={requestLocationPermission}>
          <MaterialIcons name="location-on" size={20} color={COLORS.background} />
          <ButtonText>Solicitar Permisos</ButtonText>
        </ActionButton>
      </Container>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <Container>
      <StatusCard>
        <StatusIcon status={statusInfo.status}>
          <MaterialIcons 
            name={statusInfo.icon} 
            size={30} 
            color="white" 
          />
        </StatusIcon>
        <StatusText>{statusInfo.text}</StatusText>
      </StatusCard>      {location && (
        <>
          <CoordinatesCard>
            <CardTitle>Coordenadas</CardTitle>
            <CoordinateRow>
              <CoordinateLabel>Latitud:</CoordinateLabel>
              <CoordinateValue>{location.latitude.toFixed(6)}</CoordinateValue>
              <TouchableOpacity onPress={copyCoordinates}>
                <MaterialIcons name="content-copy" size={20} color={COLORS.accent} />
              </TouchableOpacity>
            </CoordinateRow>
            <CoordinateRow>
              <CoordinateLabel>Longitud:</CoordinateLabel>
              <CoordinateValue>{location.longitude.toFixed(6)}</CoordinateValue>
              <TouchableOpacity onPress={copyCoordinates}>
                <MaterialIcons name="content-copy" size={20} color={COLORS.accent} />
              </TouchableOpacity>
            </CoordinateRow>
            {location.altitude !== null && (
              <CoordinateRow>
                <CoordinateLabel>Altitud:</CoordinateLabel>
                <CoordinateValue>{location.altitude.toFixed(1)}m</CoordinateValue>
                <View style={{ width: 20 }} />
              </CoordinateRow>
            )}
            {location.speed !== null && location.speed > 0 && (
              <CoordinateRow>
                <CoordinateLabel>Velocidad:</CoordinateLabel>
                <CoordinateValue>{(location.speed * 3.6).toFixed(1)} km/h</CoordinateValue>
                <View style={{ width: 20 }} />
              </CoordinateRow>
            )}
            <AccuracyIndicator>
              <AccuracyDot level={getAccuracyLevel(location.accuracy)} />
              <AccuracyText>{getAccuracyText(location.accuracy)}</AccuracyText>
            </AccuracyIndicator>
          </CoordinatesCard>

          {address && (
            <AddressCard>
              <CardTitle>Dirección</CardTitle>
              <AddressText>
                {[address.street, address.city, address.region, address.country]
                  .filter(Boolean)
                  .join(', ')}
                {address.postalCode && ` ${address.postalCode}`}
              </AddressText>
            </AddressCard>
          )}
        </>
      )}

      <ActionButton onPress={getCurrentLocation} disabled={status === 'loading'}>
        <MaterialIcons 
          name="my-location" 
          size={20} 
          color={COLORS.background} 
        />
        <ButtonText>Actualizar Ubicación</ButtonText>
      </ActionButton>

      {location && (
        <>
          <ActionButton 
            variant="secondary" 
            onPress={isWatching ? stopWatchingLocation : startWatchingLocation}
          >
            <MaterialIcons 
              name={isWatching ? "location-disabled" : "track-changes"} 
              size={20} 
              color={COLORS.textPrimary} 
            />
            <ButtonText variant="secondary">
              {isWatching ? 'Detener Seguimiento' : 'Seguimiento en Tiempo Real'}
            </ButtonText>
          </ActionButton>

          <ActionButton variant="secondary" onPress={shareLocation}>
            <MaterialIcons name="share" size={20} color={COLORS.textPrimary} />
            <ButtonText variant="secondary">Compartir Ubicación</ButtonText>
          </ActionButton>
        </>
      )}
    </Container>
  );
};

export default LocationScreen;
