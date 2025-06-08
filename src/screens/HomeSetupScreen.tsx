import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, Switch, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import { useHomeLocation } from '../contexts/HomeLocationContext';
import { PROXIMITY_RADIUS_OPTIONS } from '../types/location';
import { calculateDistance } from '../hooks/useProximityDetection';

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${COLORS.background};
  padding: ${SPACING.lg}px;
`;

const Card = styled.View`
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

const FormGroup = styled.View`
  margin-bottom: ${SPACING.lg}px;
`;

const Label = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  margin-bottom: ${SPACING.sm}px;
`;

const TextInput = styled.TextInput`
  background-color: ${COLORS.background};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  border: 1px solid ${COLORS.accent}33;
`;

const CoordinatesContainer = styled.View`
  background-color: ${COLORS.background};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.sm}px;
`;

const CoordinateRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.xs}px;
`;

const CoordinateLabel = styled.Text`
  color: ${COLORS.accent};
  font-size: ${TYPOGRAPHY.small}px;
`;

const CoordinateValue = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.small}px;
  font-weight: 500;
`;

const RadiusSelector = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${SPACING.sm}px;
  margin-top: ${SPACING.sm}px;
`;

const RadiusButton = styled.TouchableOpacity<{ selected: boolean }>`
  background-color: ${({ selected }: { selected: boolean }) => selected ? COLORS.accent : COLORS.background};
  border-radius: 8px;
  padding: ${SPACING.sm}px ${SPACING.md}px;
  border: 1px solid ${COLORS.accent}33;
`;

const RadiusButtonText = styled.Text<{ selected: boolean }>`
  color: ${({ selected }: { selected: boolean }) => selected ? COLORS.background : COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.small}px;
  font-weight: 600;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' | 'outline' }>`
  background-color: ${({ variant }: { variant?: 'primary' | 'secondary' | 'outline' }) => 
    variant === 'secondary' ? COLORS.background :
    variant === 'outline' ? 'transparent' :
    COLORS.accent
  };
  border: ${({ variant }: { variant?: 'primary' | 'secondary' | 'outline' }) => variant === 'outline' ? `1px solid ${COLORS.accent}` : 'none'};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  align-items: center;
  margin-bottom: ${SPACING.md}px;
  flex-direction: row;
  justify-content: center;
`;

const ButtonText = styled.Text<{ variant?: 'primary' | 'secondary' | 'outline' }>`
  color: ${({ variant }: { variant?: 'primary' | 'secondary' | 'outline' }) => 
    variant === 'secondary' ? COLORS.textPrimary :
    variant === 'outline' ? COLORS.accent :
    COLORS.background
  };
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  margin-left: ${SPACING.sm}px;
`;

const SwitchRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${SPACING.md}px;
`;

const SwitchLabel = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  flex: 1;
`;

const LocationList = styled.View`
  margin-top: ${SPACING.lg}px;
`;

const LocationItem = styled.View`
  background-color: ${COLORS.background};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.sm}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LocationInfo = styled.View`
  flex: 1;
`;

const LocationName = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  margin-bottom: ${SPACING.xs}px;
`;

const LocationDetails = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
`;

const LocationActions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${SPACING.sm}px;
`;

const StatusDot = styled.View<{ active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({ active }: { active: boolean }) => active ? COLORS.statusGreen : COLORS.statusRed};
  margin-right: ${SPACING.sm}px;
`;

interface SetupFormData {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  radius: number;
  address: string;
  isActive: boolean;
}

const HomeSetupScreen: React.FC = () => {
  const { state, saveHomeLocation, updateHomeLocation, deleteHomeLocation } = useHomeLocation();
  const { homeLocations } = state;

  const [formData, setFormData] = useState<SetupFormData>({
    name: '',
    coordinates: null,
    radius: 100,
    address: '',
    isActive: true,
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    // Check if this is the first time (no home locations)
    if (homeLocations.length === 0) {
      setShowForm(true);
    }
  }, [homeLocations]);

  const getCurrentCoordinates = async () => {
    try {
      setIsGettingLocation(true);

      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== Location.PermissionStatus.GRANTED) {
          Alert.alert('Error', 'Permisos de ubicación requeridos');
          return;
        }
      }

      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert('Error', 'Servicios de ubicación desactivados');
        return;
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const coordinates = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };

      setFormData(prev => ({ ...prev, coordinates }));

      // Try to get address
      try {
        const addressResult = await Location.reverseGeocodeAsync(coordinates);
        if (addressResult.length > 0) {
          const addr = addressResult[0];
          const addressString = [addr.name, addr.street, addr.city, addr.region]
            .filter(Boolean)
            .join(', ');
          setFormData(prev => ({ ...prev, address: addressString }));
        }
      } catch (error) {
        console.log('Could not get address:', error);
      }

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!formData.coordinates) {
      Alert.alert('Error', 'Las coordenadas son requeridas');
      return;
    }

    try {
      if (editingId) {
        await updateHomeLocation(editingId, {
          name: formData.name.trim(),
          coordinates: formData.coordinates,
          radius: formData.radius,
          address: formData.address.trim(),
          isActive: formData.isActive,
        });
        Alert.alert('Éxito', 'Ubicación de casa actualizada');
      } else {
        await saveHomeLocation({
          name: formData.name.trim(),
          coordinates: formData.coordinates,
          radius: formData.radius,
          address: formData.address.trim(),
          isActive: formData.isActive,
        });
        Alert.alert('Éxito', 'Ubicación de casa guardada');
      }

      // Reset form
      setFormData({
        name: '',
        coordinates: null,
        radius: 100,
        address: '',
        isActive: true,
      });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la ubicación');
    }
  };

  const handleEdit = (location: any) => {
    setFormData({
      name: location.name,
      coordinates: location.coordinates,
      radius: location.radius,
      address: location.address || '',
      isActive: location.isActive,
    });
    setEditingId(location.id);
    setShowForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteHomeLocation(id),
        },
      ]
    );
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateHomeLocation(id, { isActive });
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: '',
      coordinates: null,
      radius: 100,
      address: '',
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <Container showsVerticalScrollIndicator={false}>
      {!showForm && (
        <Card>
          <CardTitle>Ubicaciones de Casa</CardTitle>
          
          <ActionButton onPress={() => setShowForm(true)}>
            <MaterialIcons name="add" size={20} color={COLORS.background} />
            <ButtonText>Agregar Nueva Ubicación</ButtonText>
          </ActionButton>

          <LocationList>
            {homeLocations.map((location) => (
              <LocationItem key={location.id}>
                <StatusDot active={location.isActive} />
                <LocationInfo>
                  <LocationName>{location.name}</LocationName>
                  <LocationDetails>
                    Radio: {location.radius}m • {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
                  </LocationDetails>
                  {location.address && (
                    <LocationDetails>{location.address}</LocationDetails>
                  )}
                </LocationInfo>
                <LocationActions>
                  <Switch
                    value={location.isActive}
                    onValueChange={(value) => handleToggleActive(location.id, value)}
                    trackColor={{ false: COLORS.secondary, true: COLORS.accent }}
                    thumbColor={COLORS.textPrimary}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                  <TouchableOpacity onPress={() => handleEdit(location)}>
                    <MaterialIcons name="edit" size={20} color={COLORS.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(location.id, location.name)}>
                    <MaterialIcons name="delete" size={20} color={COLORS.statusRed} />
                  </TouchableOpacity>
                </LocationActions>
              </LocationItem>
            ))}
            
            {homeLocations.length === 0 && (
              <LocationDetails style={{ textAlign: 'center', padding: SPACING.lg }}>
                No hay ubicaciones configuradas
              </LocationDetails>
            )}
          </LocationList>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardTitle>
            {editingId ? 'Editar Ubicación de Casa' : 'Nueva Ubicación de Casa'}
          </CardTitle>

          <FormGroup>
            <Label>Nombre de la ubicación</Label>
            <TextInput
              value={formData.name}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Ej: Casa Principal, Oficina, etc."
              placeholderTextColor={`${COLORS.textPrimary}66`}
            />
          </FormGroup>

          <FormGroup>
            <Label>Coordenadas</Label>
            <ActionButton
              variant="outline"
              onPress={getCurrentCoordinates}
              disabled={isGettingLocation}
            >
              <MaterialIcons 
                name={isGettingLocation ? "hourglass-empty" : "my-location"} 
                size={20} 
                color={COLORS.accent} 
              />
              <ButtonText variant="outline">
                {isGettingLocation ? 'Obteniendo...' : 'Usar Ubicación Actual'}
              </ButtonText>
            </ActionButton>

            {formData.coordinates && (
              <CoordinatesContainer>
                <CoordinateRow>
                  <CoordinateLabel>Latitud:</CoordinateLabel>
                  <CoordinateValue>{formData.coordinates.latitude.toFixed(6)}</CoordinateValue>
                </CoordinateRow>
                <CoordinateRow>
                  <CoordinateLabel>Longitud:</CoordinateLabel>
                  <CoordinateValue>{formData.coordinates.longitude.toFixed(6)}</CoordinateValue>
                </CoordinateRow>
              </CoordinatesContainer>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Radio de proximidad</Label>
            <RadiusSelector>
              {PROXIMITY_RADIUS_OPTIONS.map((radius) => (
                <RadiusButton
                  key={radius}
                  selected={formData.radius === radius}
                  onPress={() => setFormData(prev => ({ ...prev, radius }))}
                >
                  <RadiusButtonText selected={formData.radius === radius}>
                    {radius}m
                  </RadiusButtonText>
                </RadiusButton>
              ))}
            </RadiusSelector>
          </FormGroup>

          <FormGroup>
            <Label>Dirección (opcional)</Label>
            <TextInput
              value={formData.address}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, address: text }))}
              placeholder="Dirección de la ubicación"
              placeholderTextColor={`${COLORS.textPrimary}66`}
              multiline
            />
          </FormGroup>

          <SwitchRow>
            <SwitchLabel>Activar detección</SwitchLabel>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
              trackColor={{ false: COLORS.secondary, true: COLORS.accent }}
              thumbColor={COLORS.textPrimary}
            />
          </SwitchRow>

          <ActionButton onPress={handleSave}>
            <MaterialIcons name="save" size={20} color={COLORS.background} />
            <ButtonText>{editingId ? 'Actualizar' : 'Guardar'}</ButtonText>
          </ActionButton>

          <ActionButton variant="secondary" onPress={cancelEdit}>
            <MaterialIcons name="cancel" size={20} color={COLORS.textPrimary} />
            <ButtonText variant="secondary">Cancelar</ButtonText>
          </ActionButton>
        </Card>
      )}
    </Container>
  );
};

export default HomeSetupScreen;
