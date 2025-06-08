import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, SafeAreaView, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import styled, { ThemeProvider } from 'styled-components/native';
import { theme } from './src/theme';
import { HomeLocationProvider } from './src/contexts/HomeLocationContext';
// Import screens
import HomeScreen from './src/screens/HomeScreen';
import DevicesScreen from './src/screens/DevicesScreen';
import StatsScreen from './src/screens/StatsScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import LocationScreen from './src/screens/LocationScreen';
import MoreScreen from './src/screens/MoreScreen';

const Tab = createBottomTabNavigator();

const AppContainer = styled.View`
    flex: 1;
    background-color: ${({ theme }: { theme: any }) => theme.COLORS.background};
`;

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <HomeLocationProvider>
                    <ThemeProvider theme={theme}>
                        <NavigationContainer>
                            <AppContainer>
                                <StatusBar barStyle="light-content" backgroundColor={theme.COLORS.background} />
                                <Tab.Navigator
                                    screenOptions={{
                                        tabBarStyle: {
                                            backgroundColor: theme.COLORS.secondary,
                                            height: Platform.OS === 'android' ? 105 : 85,
                                            borderTopWidth: 0,
                                            paddingBottom: Platform.OS === 'android' ? 30 : 8,
                                            paddingTop: 8,
                                        },
                                        tabBarActiveTintColor: theme.COLORS.accent,
                                        tabBarInactiveTintColor: `${theme.COLORS.textPrimary}99`,
                                        headerStyle: {
                                            backgroundColor: theme.COLORS.background,
                                            height: 56,
                                        },
                                        headerTintColor: theme.COLORS.textPrimary,
                                        headerTitleStyle: {
                                            fontSize: theme.TYPOGRAPHY.subtitle,
                                            fontWeight: '600',
                                        },
                                    }}
                                >
                                    <Tab.Screen
                                        name="Home"
                                        component={HomeScreen}
                                        options={{
                                            tabBarIcon: ({ color, size }) => (
                                                <MaterialIcons name="home" size={size} color={color} />
                                            ),
                                        }}
                                    />
                                    <Tab.Screen
                                        name="Devices"
                                        component={DevicesScreen}
                                        options={{
                                            tabBarIcon: ({ color, size }) => (
                                                <MaterialIcons name="tv" size={size} color={color} />
                                            ),
                                        }}
                                    />
                                    <Tab.Screen
                                        name="Stats"
                                        component={StatsScreen}
                                        options={{
                                            tabBarIcon: ({ color, size }) => (
                                                <MaterialIcons name="bar-chart" size={size} color={color} />
                                            ),
                                        }}
                                    />
                                    <Tab.Screen
                                        name="Groups"
                                        component={GroupsScreen}
                                        options={{
                                            tabBarIcon: ({ color, size }) => (
                                                <MaterialIcons name="group" size={size} color={color} />
                                            ),
                                        }}
                                    />
                                    <Tab.Screen
                                        name="Location"
                                        component={LocationScreen}
                                        options={{
                                            tabBarIcon: ({ color, size }) => (
                                                <MaterialIcons name="location-on" size={size} color={color} />
                                            ),
                                        }}
                                    />
                                    <Tab.Screen
                                        name="More"
                                        component={MoreScreen}
                                        options={{
                                            tabBarIcon: ({ color, size }) => (
                                                <MaterialIcons name="more-horiz" size={size} color={color} />
                                            ),
                                        }}
                                    />
                                </Tab.Navigator>
                            </AppContainer>
                        </NavigationContainer>
                    </ThemeProvider>
                </HomeLocationProvider>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}