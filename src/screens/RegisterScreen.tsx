import React, { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native'
import styled from 'styled-components/native'
import { MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { COLORS, TYPOGRAPHY, SPACING } from '../theme'

interface RegisterScreenProps {
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
  margin-top: ${SPACING.md}px;
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

const PasswordRequirements = styled.View`
  margin-top: ${SPACING.sm}px;
  padding: ${SPACING.sm}px;
  background-color: ${COLORS.secondary};
  border-radius: 8px;
`

const RequirementText = styled.Text<{ met?: boolean }>`
  font-size: ${TYPOGRAPHY.small}px;
  color: ${({ met }: { met?: boolean }) => met ? COLORS.statusGreen : COLORS.textPrimary};
  margin-bottom: ${SPACING.xs}px;
`

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const handleRegister = async () => {
    // Validaciones
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos')
      return
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden')
      return
    }

    if (!isValidPassword(password)) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await signUp(email.trim().toLowerCase(), password, fullName.trim())
      
      if (error) {
        let errorMessage = 'Error al crear la cuenta'
        
        if (error.message?.includes('User already registered')) {
          errorMessage = 'Este email ya está registrado'
        } else if (error.message?.includes('Password should be at least 6 characters')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres'
        } else if (error.message?.includes('Invalid email')) {
          errorMessage = 'Email inválido'
        }
        
        Alert.alert('Error', errorMessage)
      } else {
        Alert.alert(
          'Cuenta creada',
          'Revisa tu email para confirmar tu cuenta antes de iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        )
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado. Intenta nuevamente')
      console.error('Register error:', error)
    } finally {
      setLoading(false)
    }
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidPassword = (password: string) => {
    return password.length >= 6
  }

  const passwordRequirements = [
    { text: 'Al menos 6 caracteres', met: password.length >= 6 },
    { text: 'Contiene letras', met: /[a-zA-Z]/.test(password) },
    { text: 'Las contraseñas coinciden', met: password === confirmPassword && password.length > 0 }
  ]

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
            <Title>Crear Cuenta</Title>
            <Subtitle>Regístrate para comenzar</Subtitle>
          </Header>

          <Form>
            <Label>Nombre completo</Label>
            <Input
              placeholder="Tu nombre completo"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              editable={!loading}
              placeholderTextColor={`${COLORS.textPrimary}66`}
            />

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

            <Label>Confirmar contraseña</Label>
            <Input
              placeholder="Confirma tu contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
              placeholderTextColor={`${COLORS.textPrimary}66`}
            />

            {password.length > 0 && (
              <PasswordRequirements>
                {passwordRequirements.map((req, index) => (
                  <RequirementText key={index} met={req.met}>
                    {req.met ? '✓' : '○'} {req.text}
                  </RequirementText>
                ))}
              </PasswordRequirements>
            )}

            <Button 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textPrimary} size="small" />
              ) : (
                <ButtonText>Crear Cuenta</ButtonText>
              )}
            </Button>
          </Form>

          <Footer>
            <FooterText>¿Ya tienes cuenta? </FooterText>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <LinkText>Iniciar Sesión</LinkText>
            </TouchableOpacity>
          </Footer>
        </ScrollContainer>
      </KeyboardAvoidingView>
    </Container>
  )
}
