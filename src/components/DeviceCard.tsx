import React from 'react';
import { TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';

const CardContainer = styled.View`
  background-color: ${COLORS.secondary};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin: ${SPACING.xs}px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
`;

const CardHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${SPACING.sm}px;
`;

const CardTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  flex: 1;
  margin-left: ${SPACING.sm}px;
`;

const CardSubtitle = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
  margin-bottom: ${SPACING.sm}px;
`;

const StatusIndicator = styled.View<{ status: 'online' | 'offline' }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${(props: { status: string; }) => props.status === 'online' ? COLORS.statusGreen : COLORS.statusRed};
`;

interface DeviceCardProps {
    icon: string;
    title: string;
    location: string;
    status: 'online' | 'offline';
    isOn: boolean;
    onToggle: (value: boolean) => void;
    onPress: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
                                                          icon,
                                                          title,
                                                          location,
                                                          status,
                                                          isOn,
                                                          onToggle,
                                                          onPress,
                                                      }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <CardContainer>
                <CardHeader>
                    <MaterialIcons name={icon as any} size={24} color={COLORS.accent} />
                    <CardTitle>{title}</CardTitle>
                    <StatusIndicator status={status} />
                </CardHeader>
                <CardSubtitle>{location}</CardSubtitle>
                <Switch
                    value={isOn}
                    onValueChange={onToggle}
                    trackColor={{ false: COLORS.secondary, true: COLORS.accent }}
                    thumbColor={COLORS.textPrimary}
                />
            </CardContainer>
        </TouchableOpacity>
    );
};