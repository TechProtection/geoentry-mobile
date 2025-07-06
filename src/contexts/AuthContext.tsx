import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, AuthUser, Profile } from '../services/authService'
import { apiService } from '../services/apiService'
import { Session } from '@supabase/supabase-js'

interface AuthContextType {
  session: Session | null
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    authService.getSession().then((session) => {
      setSession(session)
      if (session?.user) {
        loadUserProfile()
      } else {
        console.log('No initial session found');
        setLoading(false)
      }
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        if (session?.user) {
          await loadUserProfile()
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      const userProfile = await authService.getCurrentUserProfile()
      
      if (userProfile) {
        setProfile(userProfile)
        setUser({
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          avatar_url: userProfile.avatar_url,
          role: userProfile.role
        })

        // Registrar dispositivo automáticamente cuando se carga el perfil
        setTimeout(async () => {
          try {
            await apiService.registerDevice()
          } catch (error) {
            console.warn('Failed to register device:', error)
          }
        }, 500) // Delay menor porque el perfil ya está cargado
      } else {
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await authService.signIn(email, password)
    
    if (!error) {
      // El perfil se cargará automáticamente por el onAuthStateChange
    } else {
      setLoading(false)
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    const { error } = await authService.signUp(email, password, fullName)
    
    if (!error) {
      // El perfil se cargará automáticamente por el onAuthStateChange
    } else {
      setLoading(false)
    }
    
    return { error }
  }

  const signOut = async () => {
    setLoading(true)
    await authService.signOut()
    // El estado se limpiará automáticamente por el onAuthStateChange
  }

  const refreshProfile = async () => {
    if (session?.user) {
      await loadUserProfile()
    }
  }

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}