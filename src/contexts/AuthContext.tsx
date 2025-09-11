import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  session: Session | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (supabaseUser: any) => {
    try {
      console.log('🔍 Buscando perfil para usuario:', {
        id: supabaseUser.id,
        email: supabaseUser.email,
        metadata: supabaseUser.user_metadata
      })
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (error) {
        console.error('❌ Error obteniendo perfil:', error)
        // Si no existe perfil, crear uno básico
        if (error.code === 'PGRST116') {
          console.log('📝 Creando perfil básico...')
          
          // Determinar rol basado en email
          let role = 'receptionist' // Por defecto
          if (supabaseUser.email === 'admin@gameboxservice.com') {
            role = 'admin'
          } else if (supabaseUser.user_metadata?.role) {
            role = supabaseUser.user_metadata.role
          }
          
          console.log('🎭 Rol asignado:', role)
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: supabaseUser.id,
              email: supabaseUser.email,
              full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
              role: role
            })
            .select()
            .single()

          if (createError) {
            console.error('❌ Error creando perfil:', createError)
            setUser(null)
          } else {
            console.log('✅ Perfil creado:', newProfile)
            setUser(newProfile)
          }
        } else {
          setUser(null)
        }
      } else {
        console.log('✅ Perfil encontrado:', data)
        console.log('🎭 Rol del usuario:', data.role)
        setUser(data)
      }
    } catch (error) {
      console.error('❌ Error inesperado obteniendo perfil:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Iniciando logout...')
      
      // First clear local state
      setUser(null)
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.warn('⚠️ Error durante logout, pero continuando:', error.message)
        // Even if logout fails on server, we cleared local state
      } else {
        console.log('✅ Logout exitoso')
      }
    } catch (error) {
      console.warn('⚠️ Error durante logout, pero continuando:', error)
      // Even if logout fails, we already cleared local state
    }
  }

  const value = {
    user,
    session,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
