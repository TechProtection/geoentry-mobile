import React, { useEffect, useRef } from 'react';
import { Modal, Animated, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import { HomeLocation } from '../types/location';

interface ProximityModalProps {
  visible: boolean;
  homeLocation: HomeLocation | null;
  distance: number;
  onEnterHome: () => void;
  onClose: () => void;
  onDismiss?: () => void;
}

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding: ${SPACING.lg}px;
`;

const ModalContainer = styled.View`
  background-color: ${COLORS.secondary};
  border-radius: 16px;
  padding: ${SPACING.xl}px;
  width: 100%;
  max-width: 350px;
  align-items: center;
  elevation: 8;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
`;

const IconContainer = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${COLORS.accent}33;
  align-items: center;
  justify-content: center;
  margin-bottom: ${SPACING.lg}px;
`;

const PulsingCircle = styled(Animated.View)`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${COLORS.accent}20;
`;

const ModalTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.title}px;
  font-weight: bold;
  text-align: center;
  margin-bottom: ${SPACING.sm}px;
`;

const ModalSubtitle = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.body}px;
  text-align: center;
  margin-bottom: ${SPACING.lg}px;
`;

const DistanceContainer = styled.View`
  background-color: ${COLORS.accent}33;
  border-radius: 8px;
  padding: ${SPACING.md}px ${SPACING.lg}px;
  margin-bottom: ${SPACING.xl}px;
`;

const DistanceText = styled.Text`
  color: ${COLORS.accent};
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: 600;
  text-align: center;
`;

const HomeLocationName = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  text-align: center;
  margin-bottom: ${SPACING.md}px;
`;

const HomeLocationAddress = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
  text-align: center;
  margin-bottom: ${SPACING.lg}px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  gap: ${SPACING.md}px;
  width: 100%;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  background-color: ${({ variant }: { variant?: 'primary' | 'secondary' }) => variant === 'secondary' ? COLORS.background : COLORS.accent};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  min-height: 48px;
`;

const ButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>`
  color: ${({ variant }: { variant?: 'primary' | 'secondary' }) => variant === 'secondary' ? COLORS.textPrimary : COLORS.background};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  margin-left: ${SPACING.sm}px;
`;

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: ${SPACING.md}px;
  right: ${SPACING.md}px;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${COLORS.background}66;
  align-items: center;
  justify-content: center;
`;

const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

export const ProximityModal: React.FC<ProximityModalProps> = ({
  visible,
  homeLocation,
  distance,
  onEnterHome,
  onClose,
  onDismiss,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing animation for the icon
  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (visible) {
      startPulse();
    }

    return () => {
      pulseAnim.setValue(1);
    };
  }, [visible, pulseAnim]);

  // Modal entrance animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, scaleAnim]);

  const handleBackdropPress = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      onClose();
    }
  };

  if (!homeLocation) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <ModalOverlay>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                  { scale: scaleAnim },
                ],
                opacity: slideAnim,
              }}
            >
              <ModalContainer>
                <CloseButton onPress={onClose}>
                  <MaterialIcons name="close" size={20} color={COLORS.textPrimary} />
                </CloseButton>

                <IconContainer>
                  <PulsingCircle
                    style={{
                      transform: [{ scale: pulseAnim }],
                    }}
                  />
                  <MaterialIcons name="home" size={40} color={COLORS.accent} />
                </IconContainer>

                <ModalTitle>¡Estás cerca de casa!</ModalTitle>
                
                {homeLocation.name && (
                  <HomeLocationName>{homeLocation.name}</HomeLocationName>
                )}
                
                {homeLocation.address && (
                  <HomeLocationAddress>{homeLocation.address}</HomeLocationAddress>
                )}

                <DistanceContainer>
                  <DistanceText>{formatDistance(distance)} de distancia</DistanceText>
                </DistanceContainer>

                <ModalSubtitle>
                  ¿Te gustaría activar los dispositivos de casa?
                </ModalSubtitle>

                <ButtonContainer>
                  <ActionButton variant="secondary" onPress={onClose}>
                    <MaterialIcons name="close" size={20} color={COLORS.textPrimary} />
                    <ButtonText variant="secondary">Cerrar</ButtonText>
                  </ActionButton>

                  <ActionButton onPress={onEnterHome}>
                    <MaterialIcons name="home" size={20} color={COLORS.background} />
                    <ButtonText>Entrar a Casa</ButtonText>
                  </ActionButton>
                </ButtonContainer>
              </ModalContainer>
            </Animated.View>
          </TouchableWithoutFeedback>
        </ModalOverlay>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
