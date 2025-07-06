import React from 'react';
import { View, TouchableOpacity, Animated, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabBarContainer = styled.View<{ bottomInset: number }>`
  flex-direction: row;
  height: ${({ bottomInset }: { bottomInset: number }) => 70 + bottomInset}px;
  background-color: ${COLORS.secondary};
  border-top-width: 1px;
  border-top-color: ${COLORS.background};
  padding-horizontal: ${SPACING.md}px;
  padding-top: ${SPACING.sm}px;
  padding-bottom: ${({ bottomInset }: { bottomInset: number }) => Math.max(bottomInset, SPACING.md)}px;
  elevation: 8;
  shadow-color: #000;
  shadow-offset: 0px -2px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
`;

const TabButton = styled.TouchableOpacity<{ isActive: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-vertical: ${SPACING.xs}px;
  border-radius: 12px;
  background-color: ${({ isActive }: { isActive: boolean }) => isActive ? COLORS.accent + '15' : 'transparent'};
  margin-horizontal: ${SPACING.xs}px;
`;

const TabIconContainer = styled.View<{ isActive: boolean }>`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background-color: ${({ isActive }: { isActive: boolean }) => isActive ? COLORS.accent + '20' : 'transparent'};
  margin-bottom: ${SPACING.xs}px;
`;

const TabLabel = styled.Text<{ isActive: boolean }>`
  color: ${({ isActive }: { isActive: boolean }) => isActive ? COLORS.accent : COLORS.textPrimary + '66'};
  font-size: 10px;
  font-weight: ${({ isActive }: { isActive: boolean }) => isActive ? '700' : '500'};
  text-align: center;
`;

const ActiveIndicator = styled.View`
  position: absolute;
  top: -2px;
  width: 24px;
  height: 3px;
  background-color: ${COLORS.accent};
  border-radius: 2px;
`;

interface Tab {
  name: string;
  title: string;
  icon: string;
  focusedIcon?: string;
}

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const tabs: Tab[] = [
  { name: 'Home', title: 'Dashboard', icon: 'home', focusedIcon: 'home' },
  { name: 'Groups', title: 'Locations', icon: 'map', focusedIcon: 'map' },
  { name: 'Devices', title: 'Devices', icon: 'smartphone', focusedIcon: 'smartphone' },
  { name: 'Stats', title: 'Events', icon: 'show-chart', focusedIcon: 'show-chart' },
  { name: 'Location', title: 'Analytics', icon: 'analytics', focusedIcon: 'analytics' },
  { name: 'More', title: 'Support', icon: 'help', focusedIcon: 'help' },
];

export const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <TabBarContainer bottomInset={insets.bottom}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const tab = tabs.find(t => t.name === route.name);
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        if (!tab) return null;

        const iconName = isFocused && tab.focusedIcon ? tab.focusedIcon : tab.icon;

        return (
          <TabButton
            key={route.key}
            isActive={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
          >
            {isFocused && <ActiveIndicator />}
            <TabIconContainer isActive={isFocused}>
              <MaterialIcons
                name={iconName as any}
                size={isFocused ? 22 : 20}
                color={isFocused ? COLORS.accent : COLORS.textPrimary + '66'}
              />
            </TabIconContainer>
            <TabLabel isActive={isFocused}>{tab.title}</TabLabel>
          </TabButton>
        );        })}
    </TabBarContainer>
  );
};
