import React, { useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';

const Container = styled.View`
  flex: 1;
  background-color: ${COLORS.background};
  padding: ${SPACING.lg}px;
`;

const SegmentedControl = styled.View`
  flex-direction: row;
  background-color: ${COLORS.secondary};
  border-radius: 8px;
  margin-bottom: ${SPACING.lg}px;
`;

const SegmentButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: ${SPACING.md}px;
  align-items: center;
  background-color: ${(props: { active: any; }) => props.active ? COLORS.accent : 'transparent'};
  border-radius: 8px;
`;

const SegmentText = styled.Text<{ active: boolean }>`
  color: ${(props: { active: any; }) => props.active ? COLORS.background : COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.small}px;
  font-weight: 600;
`;

const FiltersRow = styled.View`
  flex-direction: row;
  gap: ${SPACING.md}px;
  margin-bottom: ${SPACING.lg}px;
`;

const FilterButton = styled.TouchableOpacity`
  background-color: ${COLORS.secondary};
  border-radius: 8px;
  padding: ${SPACING.sm}px ${SPACING.md}px;
  flex-direction: row;
  align-items: center;
  gap: ${SPACING.xs}px;
`;

const FilterText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.small}px;
`;

const EventRow = styled.View`
  background-color: ${COLORS.secondary}33;
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.sm}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const EventInfo = styled.View`
  flex: 1;
`;

const EventTime = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
`;

const EventDevice = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  margin-vertical: ${SPACING.xs}px;
`;

const EventAction = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
`;

const StatusBadge = styled.View<{ type: 'success' | 'warning' | 'error' }>`
  background-color: ${(props: { type: string; }) =>
    props.type === 'success' ? COLORS.statusGreen :
        props.type === 'error' ? COLORS.statusRed :
            COLORS.accent
};
  border-radius: 12px;
  padding: ${SPACING.xs}px ${SPACING.sm}px;
`;

const StatusText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.micro}px;
  font-weight: 600;
`;

const events = [
    { id: '1', time: '2:30 PM', device: 'Smart Lock', action: 'Door unlocked', type: 'success' as const },
    { id: '2', time: '1:45 PM', device: 'Climate Control', action: 'Temperature adjusted', type: 'success' as const },
    { id: '3', time: '12:15 PM', device: 'Security Camera', action: 'Motion detected', type: 'warning' as const },
    { id: '4', time: '11:30 AM', device: 'Smart Light', action: 'Connection lost', type: 'error' as const },
    { id: '5', time: '10:20 AM', device: 'Aromatic System', action: 'Schedule activated', type: 'success' as const },
];

const StatsScreen = () => {
    const [activeTab, setActiveTab] = useState('activity');

    const renderEvent = ({ item }: { item: typeof events[0] }) => (
        <EventRow>
            <EventInfo>
                <EventTime>{item.time}</EventTime>
                <EventDevice>{item.device}</EventDevice>
                <EventAction>{item.action}</EventAction>
            </EventInfo>
            <StatusBadge type={item.type}>
                <StatusText>{item.type.toUpperCase()}</StatusText>
            </StatusBadge>
        </EventRow>
    );

    return (
        <Container>
            <SegmentedControl>
                <SegmentButton
                    active={activeTab === 'activity'}
                    onPress={() => setActiveTab('activity')}
                >
                    <SegmentText active={activeTab === 'activity'}>Device Activity</SegmentText>
                </SegmentButton>
                <SegmentButton
                    active={activeTab === 'events'}
                    onPress={() => setActiveTab('events')}
                >
                    <SegmentText active={activeTab === 'events'}>System Events</SegmentText>
                </SegmentButton>
            </SegmentedControl>

            <FiltersRow>
                <FilterButton>
                    <FilterText>All Types</FilterText>
                    <MaterialIcons name="keyboard-arrow-down" size={16} color={COLORS.textPrimary} />
                </FilterButton>
                <FilterButton>
                    <FilterText>All Status</FilterText>
                    <MaterialIcons name="keyboard-arrow-down" size={16} color={COLORS.textPrimary} />
                </FilterButton>
            </FiltersRow>

            <FlatList
                data={events}
                renderItem={renderEvent}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: SPACING.xl }}
            />
        </Container>
    );
};

export default StatsScreen;