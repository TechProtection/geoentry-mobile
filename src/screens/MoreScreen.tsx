import React, { useState } from 'react';
import { ScrollView, Switch, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import { useHomeLocation } from '../contexts/HomeLocationContext';
import HomeSetupScreen from './HomeSetupScreen';

const Container = styled.View`
  flex: 1;
  background-color: ${COLORS.background};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: ${SPACING.lg}px;
`;

const SectionTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: 600;
  margin-bottom: ${SPACING.md}px;
  margin-top: ${SPACING.xl}px;
`;

const NotificationItem = styled.View`
  background-color: ${COLORS.secondary}33;
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.sm}px;
  flex-direction: row;
  align-items: center;
`;

const NotificationIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${COLORS.accent};
  align-items: center;
  justify-content: center;
  margin-right: ${SPACING.md}px;
`;

const NotificationContent = styled.View`
  flex: 1;
`;

const NotificationText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
`;

const NotificationTime = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
  margin-top: ${SPACING.xs}px;
`;

const SettingItem = styled.View`
  background-color: ${COLORS.secondary}33;
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.sm}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SettingText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  flex: 1;
`;

const BrightnessContainer = styled.View`
  background-color: ${COLORS.secondary}33;
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.sm}px;
`;

const BrightnessText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  margin-bottom: ${SPACING.sm}px;
`;

const BrightnessValue = styled.Text`
  color: ${COLORS.accent};
  font-size: ${TYPOGRAPHY.small}px;
  text-align: center;
  margin-top: ${SPACING.sm}px;
`;

const SliderPlaceholder = styled.View`
  height: 40px;
  background-color: ${COLORS.secondary};
  border-radius: 20px;
  align-items: center;
  justify-content: center;
`;

const SliderText = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
`;

const ProfileCard = styled.View`
  background-color: ${COLORS.secondary};
  border-radius: 8px;
  padding: ${SPACING.lg}px;
  margin-bottom: ${SPACING.lg}px;
  align-items: center;
`;

const ProfileAvatar = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${COLORS.accent};
  align-items: center;
  justify-content: center;
  margin-bottom: ${SPACING.md}px;
`;

const AvatarText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.title}px;
  font-weight: bold;
`;

const ProfileName = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: 600;
  margin-bottom: ${SPACING.xs}px;
`;

const ProfileDetail = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
  text-align: center;
  margin-bottom: ${SPACING.xs}px;
`;

const ActionButton = styled.TouchableOpacity<{ destructive?: boolean; accent?: boolean }>`
  background-color: ${(props: { destructive: any; accent: any; }) =>
    props.destructive ? COLORS.destructive :
        props.accent ? '#FFD700' :
            COLORS.secondary
};
  border-radius: 8px;
  padding: ${SPACING.md}px ${SPACING.lg}px;
  margin-vertical: ${SPACING.sm}px;
  align-items: center;
`;

const ButtonText = styled.Text<{ dark?: boolean }>`
  color: ${(props: { dark: any; }) => props.dark ? COLORS.background : COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
`;

const AccordionItem = styled.View`
  background-color: ${COLORS.secondary}33;
  border-radius: 8px;
  margin-bottom: ${SPACING.sm}px;
  overflow: hidden;
`;

const AccordionHeader = styled.TouchableOpacity`
  padding: ${SPACING.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const AccordionTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
`;

const AccordionContent = styled.View`
  padding: 0 ${SPACING.md}px ${SPACING.md}px ${SPACING.md}px;
`;

const AccordionText = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
  line-height: 20px;
`;

const FormContainer = styled.View`
  background-color: ${COLORS.secondary}33;
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.lg}px;
`;

const FormLabel = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.small}px;
  margin-bottom: ${SPACING.xs}px;
  margin-top: ${SPACING.sm}px;
`;

const FormInput = styled.TextInput`
  background-color: ${COLORS.secondary};
  border-radius: 4px;
  padding: ${SPACING.md}px;
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  min-height: 40px;
`;

const FormTextArea = styled.TextInput`
  background-color: ${COLORS.secondary};
  border-radius: 4px;
  padding: ${SPACING.md}px;
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  height: 80px;
  text-align-vertical: top;
`;

const notifications = [
    { id: '1', icon: 'security', text: 'Security system armed', time: '2 hours ago' },
    { id: '2', icon: 'lightbulb', text: 'Living room lights scheduled', time: '4 hours ago' },
    { id: '3', icon: 'person-add', text: 'New member added to group', time: '1 day ago' },
];

const faqItems = [
    {
        id: '1',
        question: 'How do I add a new device?',
        answer: 'Go to the Devices tab, tap the + button, and follow the setup wizard to connect your device to the network.'
    },
    {
        id: '2',
        question: 'Why is my device showing as offline?',
        answer: 'Check your WiFi connection and ensure the device is powered on. Try restarting the device or check for firmware updates.'
    },
    {
        id: '3',
        question: 'How do I share access with family members?',
        answer: 'In the Groups tab, tap "Add Member" and send an invitation link. They\'ll need to download the app and accept the invitation.'
    },
];

const MoreScreen = () => {
    const navigation = useNavigation();
    const { state } = useHomeLocation();
    const { homeLocations } = state;
    
    const [darkMode, setDarkMode] = useState(true);
    const [nightMode, setNightMode] = useState(false);
    const [brightness, setBrightness] = useState(86);
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
    const [showHomeSetup, setShowHomeSetup] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        issueType: 'Technical',
        description: ''
    });

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => console.log('Account deleted') }
            ]
        );
    };

    const handleSubmitContact = () => {
        Alert.alert('Success', 'Your message has been sent. We\'ll get back to you soon!');
        setContactForm({ name: '', email: '', issueType: 'Technical', description: '' });
    };

    return (
        <Container>
            <Content showsVerticalScrollIndicator={false}>
                <SectionTitle style={{ marginTop: 0 }}>Notifications</SectionTitle>
                {notifications.map((notification) => (
                    <NotificationItem key={notification.id}>
                        <NotificationIcon>
                            <MaterialIcons name={notification.icon as any} size={20} color={COLORS.textPrimary} />
                        </NotificationIcon>
                        <NotificationContent>
                            <NotificationText>{notification.text}</NotificationText>
                            <NotificationTime>{notification.time}</NotificationTime>
                        </NotificationContent>
                    </NotificationItem>
                ))}                
                <SectionTitle>Settings</SectionTitle>
                
                <SettingItem>
                    <SettingText>Configurar Ubicaciones de Casa</SettingText>
                    <TouchableOpacity 
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => setShowHomeSetup(true)}
                    >
                        <SettingText style={{ marginRight: SPACING.xs, color: COLORS.accent, fontSize: TYPOGRAPHY.small }}>
                            {homeLocations.length} ubicación{homeLocations.length !== 1 ? 'es' : ''}
                        </SettingText>
                        <MaterialIcons name="chevron-right" size={20} color={COLORS.accent} />
                    </TouchableOpacity>
                </SettingItem>

                <SettingItem>
                    <SettingText>Connect Device</SettingText>
                    <TouchableOpacity>
                        <MaterialIcons name="add" size={24} color={COLORS.accent} />
                    </TouchableOpacity>
                </SettingItem>

                <BrightnessContainer>
                    <BrightnessText>Lighting Controls</BrightnessText>
                    <SliderPlaceholder>
                        <SliderText>Brightness Slider (86%)</SliderText>
                    </SliderPlaceholder>
                    <BrightnessValue>{brightness}%</BrightnessValue>
                </BrightnessContainer>

                <SettingItem>
                    <SettingText>Night Mode</SettingText>
                    <Switch
                        value={nightMode}
                        onValueChange={setNightMode}
                        trackColor={{ false: COLORS.secondary, true: COLORS.accent }}
                        thumbColor={COLORS.textPrimary}
                    />
                </SettingItem>

                <SectionTitle>Support</SectionTitle>
                {faqItems.map((item) => (
                    <AccordionItem key={item.id}>
                        <AccordionHeader
                            onPress={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
                        >
                            <AccordionTitle>{item.question}</AccordionTitle>
                            <MaterialIcons
                                name={expandedFAQ === item.id ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                size={20}
                                color={COLORS.textPrimary}
                            />
                        </AccordionHeader>
                        {expandedFAQ === item.id && (
                            <AccordionContent>
                                <AccordionText>{item.answer}</AccordionText>
                            </AccordionContent>
                        )}
                    </AccordionItem>
                ))}

                <SettingItem>
                    <SettingText>Documentation</SettingText>
                    <TouchableOpacity>
                        <ButtonText>View</ButtonText>
                    </TouchableOpacity>
                </SettingItem>

                <FormContainer>
                    <AccordionTitle style={{ marginBottom: SPACING.md }}>Contact Support</AccordionTitle>

                    <FormLabel>Name</FormLabel>
                    <FormInput
                        value={contactForm.name}
                        onChangeText={(text: any) => setContactForm(prev => ({ ...prev, name: text }))}
                        placeholder="Your name"
                        placeholderTextColor={`${COLORS.textPrimary}66`}
                    />

                    <FormLabel>Email</FormLabel>
                    <FormInput
                        value={contactForm.email}
                        onChangeText={(text: any) => setContactForm(prev => ({ ...prev, email: text }))}
                        placeholder="your.email@example.com"
                        placeholderTextColor={`${COLORS.textPrimary}66`}
                        keyboardType="email-address"
                    />

                    <FormLabel>Issue Type</FormLabel>
                    <TouchableOpacity>
                        <FormInput
                            value={contactForm.issueType}
                            editable={false}
                            style={{ backgroundColor: COLORS.secondary }}
                        />
                    </TouchableOpacity>

                    <FormLabel>Description</FormLabel>
                    <FormTextArea
                        value={contactForm.description}
                        onChangeText={(text: any) => setContactForm(prev => ({ ...prev, description: text }))}
                        placeholder="Describe your issue..."
                        placeholderTextColor={`${COLORS.textPrimary}66`}
                        multiline
                    />

                    <ActionButton onPress={handleSubmitContact} style={{ marginTop: SPACING.md }}>
                        <ButtonText>Submit</ButtonText>
                    </ActionButton>
                </FormContainer>

                <SectionTitle>Profile</SectionTitle>
                <ProfileCard>
                    <ProfileAvatar>
                        <AvatarText>P</AvatarText>
                    </ProfileAvatar>
                    <ProfileName>John Doe</ProfileName>
                    <ProfileDetail>john.doe@example.com</ProfileDetail>
                    <ProfileDetail>+1 (555) 123-4567</ProfileDetail>
                    <ProfileDetail>Home Group • Admin</ProfileDetail>
                    <ProfileDetail>Member since March 2024</ProfileDetail>
                    </ProfileCard>
                <ActionButton accent>
                    <ButtonText dark>Edit Profile</ButtonText>
                </ActionButton>

                <ActionButton destructive onPress={handleDeleteAccount}>
                    <ButtonText>Delete Account</ButtonText>
                </ActionButton>
            </Content>

            {/* Home Setup Modal */}
            <Modal
                visible={showHomeSetup}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowHomeSetup(false)}
            >
                <Container style={{ paddingTop: 40 }}>
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 50,
                            right: 20,
                            zIndex: 1000,
                            backgroundColor: COLORS.secondary,
                            borderRadius: 20,
                            width: 40,
                            height: 40,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={() => setShowHomeSetup(false)}
                    >
                      <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <HomeSetupScreen />
                </Container>
            </Modal>
        </Container>
    );
};

export default MoreScreen;