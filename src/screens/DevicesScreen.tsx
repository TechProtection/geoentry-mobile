import React, { useState } from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import { DeviceCard } from '../components/DeviceCard';

const Container = styled.View`
    flex: 1;
    background-color: ${COLORS.background};
    padding: ${SPACING.lg}px;
`;

const HeaderSection = styled.View`
    margin-bottom: ${SPACING.xl}px;
`;

const Title = styled.Text`
    color: ${COLORS.textPrimary};
    font-size: ${TYPOGRAPHY.title}px;
    font-weight: bold;
    margin-bottom: ${SPACING.xs}px;
`;

const Subtitle = styled.Text`
    color: ${COLORS.textPrimary}99;
    font-size: ${TYPOGRAPHY.body}px;
`;

const devices = [
    { id: '1', icon: 'lock', title: 'Smart Lock', location: 'Front Door', status: 'online' as const, isOn: true },
    { id: '2', icon: 'lightbulb', title: 'Living Room Light', location: 'Living Room', status: 'online' as const, isOn: false },
    { id: '3', icon: 'thermostat', title: 'Climate Control', location: 'Main Floor', status: 'online' as const, isOn: true },
    { id: '4', icon: 'local-florist', title: 'Aromatic System', location: 'Bedroom', status: 'offline' as const, isOn: false },
    { id: '5', icon: 'security', title: 'Security Camera', location: 'Garage', status: 'online' as const, isOn: true },
    { id: '6', icon: 'speaker', title: 'Smart Speaker', location: 'Kitchen', status: 'online' as const, isOn: false },
];

type DeviceStates = {
    [key: string]: boolean;
};

const DevicesScreen = () => {
    const [deviceStates, setDeviceStates] = useState<DeviceStates>(
        devices.reduce((acc, device) => ({ ...acc, [device.id]: device.isOn }), {})
    );

    const handleToggle = (deviceId: string, value: boolean) => {
        setDeviceStates(prev => ({ ...prev, [deviceId]: value }));
    };

    const renderDevice = ({ item }: { item: typeof devices[0] }) => (
        <DeviceCard
            icon={item.icon}
            title={item.title}
            location={item.location}
            status={item.status}
            isOn={deviceStates[item.id]}
            onToggle={(value) => handleToggle(item.id, value)}
            onPress={() => console.log('Device pressed:', item.title)}
        />
    );

    return (
        <Container>
            <HeaderSection>
                <Title>Devices</Title>
                <Subtitle>Manage your connected devices</Subtitle>
            </HeaderSection>

            <FlatList
                data={devices}
                renderItem={renderDevice}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: SPACING.xl }}
            />
        </Container>
    );
};

export default DevicesScreen;