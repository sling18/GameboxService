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
      console.log('🔍 Buscando perfil para usuario:', supabaseUser.id)
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
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: supabaseUser.id,
              email: supabaseUser.email,
              full_name: supabaseUser.user_metadata?.full_name || 'Usuario',
              role: 'admin' // Por defecto admin para el primer usuario
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
    await supabase.auth.signOut()
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
