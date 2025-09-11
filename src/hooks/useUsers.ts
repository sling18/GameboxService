import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, UserRole } from '../types'

interface CreateUserData {
  email: string
  password: string
  full_name: string
  role: UserRole
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener todos los perfiles existentes
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) {
        throw profilesError
      }

      // Obtener todos los usuarios de auth para ver si hay usuarios sin perfil
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        console.warn('No se pudieron obtener usuarios de auth:', authError)
        setUsers(profiles || [])
        return
      }

      const allUsers: User[] = []
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

      // Procesar usuarios de auth
      for (const authUser of authUsers.users) {
        if (authUser.email && !authUser.email.includes('supabase')) {
          const existingProfile = profileMap.get(authUser.id)
          
          if (existingProfile) {
            // Usuario con perfil completo
            allUsers.push(existingProfile)
          } else {
            // Usuario sin perfil - crear perfil básico
            const newProfile: User = {
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || 'Usuario Sin Nombre',
              role: 'receptionist', // rol por defecto
              created_at: authUser.created_at,
              updated_at: authUser.updated_at || authUser.created_at
            }

            // Intentar crear el perfil en la base de datos
            try {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert(newProfile)

              if (!insertError) {
                allUsers.push(newProfile)
              }
            } catch (error) {
              console.warn('Error creando perfil automático:', error)
              // Agregar a la lista local aunque no se haya guardado
              allUsers.push(newProfile)
            }
          }
        }
      }

      // Ordenar por fecha de creación
      allUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      setUsers(allUsers)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: CreateUserData) => {
    try {
      setError(null)
      
      // Crear usuario usando signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // Crear perfil en la tabla profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role
          })
          .select()
          .single()

        if (profileError) {
          console.warn('Error creando perfil (puede haberse creado automáticamente):', profileError)
        }

        // Actualizar la lista local
        await fetchUsers()
        
        return { data: authData.user, error: null }
      }
      
      return { data: null, error: 'No se pudo crear el usuario' }
    } catch (error: any) {
      console.error('Error creating user:', error)
      setError(error.message)
      return { data: null, error: error.message }
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      setError(null)
      
      // Solo eliminar el perfil (no podemos eliminar de auth sin permisos admin)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        throw profileError
      }

      // Actualizar la lista local
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
      
      return { error: null }
    } catch (error: any) {
      console.error('Error deleting user:', error)
      setError(error.message)
      return { error: error.message }
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setError(null)
      
      // Intentar actualizar el perfil existente
      const { data, error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (profileError) {
        // Si falla, puede que el perfil no exista - intentar crearlo
        const userToUpdate = users.find(u => u.id === userId)
        if (userToUpdate) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userToUpdate.email,
              full_name: userToUpdate.full_name,
              role: newRole,
              created_at: userToUpdate.created_at,
              updated_at: new Date().toISOString()
            })

          if (insertError) {
            throw insertError
          }
        } else {
          throw profileError
        }
      }

      // Actualizar la lista local
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId 
            ? { ...user, role: newRole, updated_at: new Date().toISOString() } 
            : user
        )
      )
      
      return { data, error: null }
    } catch (error: any) {
      console.error('Error updating user role:', error)
      setError(error.message)
      return { data: null, error: error.message }
    }
  }

  const createMissingProfile = async (userId: string, email: string, fullName?: string) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: fullName || 'Usuario',
          role: 'receptionist',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Actualizar la lista local
      await fetchUsers()
      
      return { data, error: null }
    } catch (error: any) {
      console.error('Error creating missing profile:', error)
      setError(error.message)
      return { data: null, error: error.message }
    }
  }

  const createQuickUser = async (role: UserRole, name: string) => {
    const userData = {
      email: `${role}@gameboxservice.com`,
      password: '123456',
      full_name: name,
      role: role
    }
    return await createUser(userData)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    createUser,
    createQuickUser,
    deleteUser,
    updateUserRole,
    createMissingProfile,
    refreshUsers: fetchUsers
  }
}