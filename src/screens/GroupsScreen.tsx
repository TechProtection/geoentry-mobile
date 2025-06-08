import React from 'react';
import { ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import { DeviceCard } from '../components/DeviceCard';

const Container = styled.View`
  flex: 1;
  background-color: ${COLORS.background};
`;

const MapSection = styled.TouchableOpacity`
  background-color: ${COLORS.secondary};
  height: 150px;
  margin: ${SPACING.lg}px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;

const MapText = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.body}px;
  margin-top: ${SPACING.sm}px;
`;

const Content = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${SPACING.lg}px;
`;

const SectionTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: 600;
  margin-bottom: ${SPACING.md}px;
`;

const MemberRow = styled.View`
  background-color: ${COLORS.secondary}33;
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.sm}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const MemberInfo = styled.View`
  flex: 1;
`;

const MemberName = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
`;

const MemberRole = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
  margin-top: ${SPACING.xs}px;
`;

const ActionButton = styled.TouchableOpacity<{ primary?: boolean; destructive?: boolean }>`
  background-color: ${(props: { destructive: any; primary: any; }) =>
    props.destructive ? COLORS.destructive :
        props.primary ? COLORS.accent :
            COLORS.secondary
};
  border-radius: 8px;
  padding: ${SPACING.md}px ${SPACING.lg}px;
  margin-vertical: ${SPACING.sm}px;
  align-items: center;
`;

const ButtonText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
`;

const sharedDevices = [
    { id: '1', icon: 'security', title: 'Main Security', location: 'Entrance', status: 'online' as const, isOn: true },
    { id: '2', icon: 'thermostat', title: 'Common Area AC', location: 'Lobby', status: 'online' as const, isOn: false },
];

const members = [
    { id: '1', name: 'John Smith', role: 'Admin' },
    { id: '2', name: 'Sarah Johnson', role: 'Member' },
    { id: '3', name: 'Mike Wilson', role: 'Member' },
];

const GroupsScreen = () => {
    const renderDevice = ({ item }: { item: typeof sharedDevices[0] }) => (
        <DeviceCard
            icon={item.icon}
            title={item.title}
            location={item.location}
            status={item.status}
            isOn={item.isOn}
            onToggle={() => {}}
            onPress={() => {}}
        />
    );

    const renderMember = ({ item }: { item: typeof members[0] }) => (
        <MemberRow>
            <MemberInfo>
                <MemberName>{item.name}</MemberName>
                <MemberRole>{item.role}</MemberRole>
            </MemberInfo>
            <MaterialIcons name="more-vert" size={24} color={COLORS.textPrimary} />
        </MemberRow>
    );

    return (
        <Container>
            <MapSection activeOpacity={0.7}>
                <MaterialIcons name="map" size={48} color={COLORS.accent} />
                <MapText>Group Locations Map</MapText>
            </MapSection>

            <Content showsVerticalScrollIndicator={false}>
                <SectionTitle>Shared Devices</SectionTitle>
                <FlatList
                    data={sharedDevices}
                    renderItem={renderDevice}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                />

                <SectionTitle style={{ marginTop: SPACING.xl }}>Members</SectionTitle>
                <FlatList
                    data={members}
                    renderItem={renderMember}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                />

                <ActionButton primary>
                    <ButtonText>+ Add Member</ButtonText>
                </ActionButton>

                <ActionButton destructive>
                    <ButtonText>Leave Group</ButtonText>
                </ActionButton>
            </Content>
        </Container>
    );
};

export default GroupsScreen;