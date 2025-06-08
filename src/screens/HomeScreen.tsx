import React from 'react';
import { ScrollView, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import { Header } from '../components/Header';
import { StatsCard } from '../components/StatsCard';

const Container = styled.View`
  flex: 1;
  background-color: ${COLORS.background};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: ${SPACING.lg}px;
`;

const WelcomeSection = styled.View`
  margin-bottom: ${SPACING.xl}px;
`;

const WelcomeTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.title}px;
  font-weight: bold;
  margin-bottom: ${SPACING.xs}px;
`;

const WelcomeSubtitle = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.body}px;
`;

const FeatureCard = styled.TouchableOpacity`
  background-color: ${COLORS.secondary};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin: ${SPACING.xs}px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
`;

const FeatureTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.small}px;
  font-weight: 600;
  margin-top: ${SPACING.sm}px;
  text-align: center;
`;

const MapPreview = styled.TouchableOpacity`
  background-color: ${COLORS.secondary};
  border-radius: 8px;
  height: 180px;
  margin-vertical: ${SPACING.lg}px;
  align-items: center;
  justify-content: center;
`;

const MapText = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.body}px;
`;

const QuickStatsContainer = styled.View`
  margin-vertical: ${SPACING.lg}px;
`;

const SectionTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: 600;
  margin-bottom: ${SPACING.md}px;
`;

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 48) / 2; // 48 = padding + gaps

const featureCards = [
    { id: '1', icon: 'lock', title: 'Smart Lock' },
    { id: '2', icon: 'lightbulb', title: 'Smart Lighting' },
    { id: '3', icon: 'thermostat', title: 'Climate Control' },
    { id: '4', icon: 'local-florist', title: 'Aromatic System' },
];

const quickStats = [
    { value: '1.2 kW', label: 'Energy Used' },
    { value: '12', label: 'Devices Active' },
    { value: '72°F', label: 'Temperature' },
];

const HomeScreen = () => {
    const renderFeatureCard = ({ item }: { item: typeof featureCards[0] }) => (
        <FeatureCard style={{ width: cardWidth }} activeOpacity={0.7}>
            <MaterialIcons name={item.icon as any} size={32} color={COLORS.accent} />
            <FeatureTitle>{item.title}</FeatureTitle>
        </FeatureCard>
    );

    return (
        <Container>
            <Header />
            <Content showsVerticalScrollIndicator={false}>
                <WelcomeSection>
                    <WelcomeTitle>Welcome to GeoEntry</WelcomeTitle>
                    <WelcomeSubtitle>Manage your smart home devices and security</WelcomeSubtitle>
                </WelcomeSection>

                <SectionTitle>Quick Controls</SectionTitle>
                <FlatList
                    data={featureCards}
                    renderItem={renderFeatureCard}
                    numColumns={2}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingHorizontal: SPACING.xs }}
                />

                <MapPreview activeOpacity={0.7}>
                    <MaterialIcons name="map" size={48} color={COLORS.accent} />
                    <MapText>Tap to view full map</MapText>
                </MapPreview>

                <SectionTitle>Quick Stats</SectionTitle>
                <QuickStatsContainer>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {quickStats.map((stat, index) => (
                            <StatsCard key={index} value={stat.value} label={stat.label} />
                        ))}
                    </ScrollView>
                </QuickStatsContainer>
            </Content>
        </Container>
    );
};

export default HomeScreen;