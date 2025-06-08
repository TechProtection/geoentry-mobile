import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';

const HeaderContainer = styled.View`
  height: 56px;
  background-color: ${COLORS.background};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: ${SPACING.lg}px;
`;

const Logo = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: 600;
`;

const HeaderActions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${SPACING.md}px;
`;

const ProfileAvatar = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${COLORS.accent};
  align-items: center;
  justify-content: center;
`;

const AvatarText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.small}px;
  font-weight: 600;
`;

export const Header = () => {
    return (
        <HeaderContainer>
            <Logo>GeoEntry</Logo>
            <HeaderActions>
                <TouchableOpacity accessibilityLabel="Settings">
                    <MaterialIcons name="settings" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity accessibilityLabel="Notifications">
                    <MaterialIcons name="notifications" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity accessibilityLabel="Profile">
                    <ProfileAvatar>
                        <AvatarText>P</AvatarText>
                    </ProfileAvatar>
                </TouchableOpacity>
            </HeaderActions>
        </HeaderContainer>
    );
};