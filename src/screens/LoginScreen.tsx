import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import styled from 'styled-components/native'
import { MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { COLORS, TYPOGRAPHY, SPACING } from '../theme'

interface LoginScreenProps {
  navigation: any
}

const Container = styled.View`
  flex: 1;
  background-color: ${COLORS.background};
`

const ScrollContainer = styled.ScrollView`
  flex-grow: 1;
  padding: ${SPACING.lg}px;
`

const Header = styled.View`
  align-items: center;
  margin-bottom: ${SPACING.xl}px;
  margin-top: 60px;
`

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${COLORS.textPrimary};
  margin-bottom: ${SPACING.xs}px;
`

const Subtitle = styled.Text`
  font-size: ${TYPOGRAPHY.body}px;
  color: ${COLORS.textPrimary};
  text-align: center;
  opacity: 0.7;
`

const Form = styled.View`
  margin-bottom: ${SPACING.xl}px;
`

const Label = styled.Text`
  font-size: ${TYPOGRAPHY.small}px;
  color: ${COLORS.textPrimary};
  margin-bottom: ${SPACING.xs}px;
  margin-top: ${SPACING.md}px;
  font-weight: 500;
`

const Input = styled.TextInput`
  border-width: 1px;
  border-color: ${COLORS.secondary};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  font-size: 16px;
  background-color: ${COLORS.secondary};
  color: ${COLORS.textPrimary};
`

const ForgotPassword = styled.TouchableOpacity`
  align-items: flex-end;
  margin-top: ${SPACING.sm}px;
  margin-bottom: ${SPACING.lg}px;
`

const ForgotPasswordText = styled.Text`
  font-size: ${TYPOGRAPHY.small}px;
  color: ${COLORS.accent};
`

const Button = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${({ disabled }: { disabled?: boolean }) => disabled ? COLORS.secondary : COLORS.accent};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  align-items: center;
  elevation: 2;
  shadow-color: ${COLORS.accent};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  opacity: ${({ disabled }: { disabled?: boolean }) => disabled ? 0.6 : 1};
`

const ButtonText = styled.Text`
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: bold;
  color: ${COLORS.textPrimary};
`

const Footer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const FooterText = styled.Text`
  font-size: ${TYPOGRAPHY.body}px;
  color: ${COLORS.textPrimary};
  opacity: 0.7;
`

const LinkText = styled.Text`
  font-size: ${TYPOGRAPHY.body}px;
  color: ${COLORS.accent};
  font-weight: 600;
`

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos')
      return
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await signIn(email.trim().toLowerCase(), password)
      
      if (error) {
        let errorMessage = 'Error al iniciar sesión'
        
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos'
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Por favor confirma tu email antes de iniciar sesión'
        } else if (error.message?.includes('Too many requests')) {
          errorMessage = 'Demasiados intentos. Intenta más tarde'
        }
        
        Alert.alert('Error', errorMessage)
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado. Intenta nuevamente')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleForgotPassword = () => {
    // Implementar reset de contraseña
    Alert.alert('Restablecer contraseña', 'Funcionalidad en desarrollo')
  }

  return (
    <Container>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollContainer 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <Header>
            <Title>Bienvenido</Title>
            <Subtitle>Inicia sesión en tu cuenta</Subtitle>
          </Header>

          <Form>
            <Label>Email</Label>
            <Input
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              placeholderTextColor={`${COLORS.textPrimary}66`}
            />

            <Label>Contraseña</Label>
            <Input
              placeholder="Tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
              placeholderTextColor={`${COLORS.textPrimary}66`}
            />

            <ForgotPassword 
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <ForgotPasswordText>¿Olvidaste tu contraseña?</ForgotPasswordText>
            </ForgotPassword>

            <Button 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textPrimary} size="small" />
              ) : (
                <ButtonText>Iniciar Sesión</ButtonText>
              )}
            </Button>
          </Form>

          <Footer>
            <FooterText>¿No tienes cuenta? </FooterText>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              <LinkText>Registrarse</LinkText>
            </TouchableOpacity>
          </Footer>
        </ScrollContainer>
      </KeyboardAvoidingView>
    </Container>
  )
}