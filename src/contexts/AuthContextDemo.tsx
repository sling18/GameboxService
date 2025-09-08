import React, { createContext, useContext, useState } from 'react'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  session: any
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

// Usuarios de demostración
const demoUsers: User[] = [
  {
    id: '1',
    email: 'admin@gameboxservice.com',
    full_name: 'Administrador Sistema',
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'recepcion@gameboxservice.com',
    full_name: 'María Recepcionista',
    role: 'receptionist',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'tecnico@gameboxservice.com',
    full_name: 'Carlos Técnico',
    role: 'technician',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Buscar usuario de demostración
    const foundUser = demoUsers.find(u => u.email === email)
    
    if (foundUser && password === 'gameboxservice123') {
      setUser(foundUser)
      setLoading(false)
      return { error: null }
    } else {
      setLoading(false)
      return { error: { message: 'Credenciales incorrectas' } }
    }
  }

  const signOut = async () => {
    setUser(null)
  }

  const value = {
    user,
    session: user ? { user } : null,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
