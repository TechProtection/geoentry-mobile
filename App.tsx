import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, SafeAreaView, Platform, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import styled, { ThemeProvider } from 'styled-components/native';
import { theme } from './src/theme';
import { HomeLocationProvider } from './src/contexts/HomeLocationContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
// Import screens
import HomeScreen from './src/screens/HomeScreen';
import DevicesScreen from './src/screens/DevicesScreen';
import StatsScreen from './src/screens/StatsScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import LocationScreen from './src/screens/LocationScreen';
import MoreScreen from './src/screens/MoreScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AppContainer = styled.View`
    flex: 1;
    background-color: ${({ theme }: { theme: any }) => theme.COLORS.background};
`;

const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: ${theme.COLORS.background};
`;

function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: theme.COLORS.secondary,
                    height: Platform.OS === 'android' ? 85 : 85,
                    borderTopWidth: 1,
                    borderTopColor: theme.COLORS.background,
                    paddingBottom: Platform.OS === 'android' ? 15 : 10,
                    paddingTop: 8,
                    paddingHorizontal: 12,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarActiveTintColor: theme.COLORS.accent,
                tabBarInactiveTintColor: `${theme.COLORS.textPrimary}66`,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginTop: 2,
                },
                tabBarIconStyle: {
                    marginTop: 4,
                },
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
    );
}

function AppNavigator() {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <LoadingContainer>
                <ActivityIndicator size="large" color={theme.COLORS.accent} />
            </LoadingContainer>
        );
    }

    return (
        <NavigationContainer>
            <AppContainer>
                <StatusBar barStyle="light-content" backgroundColor={theme.COLORS.background} />
                {session ? <MainTabNavigator /> : <AuthStack />}
            </AppContainer>
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <AuthProvider>
                    <HomeLocationProvider>
                        <ThemeProvider theme={theme}>
                            <AppNavigator />
                        </ThemeProvider>
                    </HomeLocationProvider>
                </AuthProvider>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}