import { supabase } from '../supabase/supabase-client'
import { apiService } from './apiService'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: string
}

export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  role: string
  created_at: string
  updated_at: string
}

export const authService = {
  // Registro de usuario
  async signUp(email: string, password: string, fullName: string) {
    try {
      // 1. Crear usuario en auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (authError) throw authError

      // 2. Si el usuario fue creado, crear perfil en profiles
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: fullName,
              email: email,
              role: 'USER'
            }
          ])

        if (profileError) {
          console.error('Error creating profile:', profileError)
          // No lanzamos error aquí porque el usuario ya fue creado
        } else {
          // Registrar dispositivo automáticamente después del registro exitoso
          setTimeout(async () => {
            try {
              await apiService.registerDevice()
            } catch (error) {
              console.warn('Failed to register device after signup:', error)
            }
          }, 1000) // Delay de 1 segundo para asegurar que el perfil esté creado
        }
      }

      return { data: authData, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  },

  // Inicio de sesión
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Registrar dispositivo automáticamente después del login exitoso
      if (data.session) {
        // Ejecutar en background para no bloquear el login
        setTimeout(async () => {
          try {
            await apiService.registerDevice()
          } catch (error) {
            console.warn('Failed to register device after login:', error)
          }
        }, 1000) // Delay de 1 segundo para asegurar que el login esté completo
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  },

  // Cerrar sesión
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  },

  // Obtener sesión actual
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  },

  // Obtener perfil del usuario actual
  async getCurrentUserProfile(): Promise<Profile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return profile
    } catch (error) {
      console.error('Error getting current user profile:', error)
      return null
    }
  },

  // Actualizar perfil
  async updateProfile(updates: Partial<Profile>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  },

  // Escuchar cambios de autenticación
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Resetear contraseña
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }
}