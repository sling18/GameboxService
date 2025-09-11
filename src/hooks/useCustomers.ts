import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Customer, CreateCustomerData } from '../types'
import { useGeneralAutoRefresh } from './useAutoRefresh'
import { useAuth } from '../contexts/AuthContext'

export const useCustomers = (autoRefresh: boolean = false) => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const { user } = useAuth()

  // Auto-refresh handler - Solo si hay usuario autenticado
  const { clearAutoRefresh } = useGeneralAutoRefresh(() => {
    if (autoRefresh && user) {
      fetchCustomers()
    }
  })

  // Cleanup auto-refresh when user logs out
  useEffect(() => {
    if (!user) {
      clearAutoRefresh()
      setCustomers([]) // Clear data when user logs out
      setError(null)
      setLoading(false)
    }
  }, [user, clearAutoRefresh])

  const fetchCustomers = async () => {
    // No hacer fetch si no hay usuario autenticado
    if (!user) {
      console.log('🚫 No hay usuario autenticado, saltando fetch de clientes')
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('❌ Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCustomerByCedula = async (cedula: string): Promise<Customer | null> => {
    try {
      console.log('🔍 Buscando cliente con cédula:', cedula)
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('cedula', cedula.trim())
        .maybeSingle() // Usar maybeSingle en lugar de single para evitar errores

      if (error) {
        console.error('❌ Error buscando cliente:', error)
        if (error.code === 'PGRST116') {
          console.log('📝 No se encontró cliente con esa cédula')
          return null // No customer found
        }
        throw error
      }
      
      console.log('✅ Cliente encontrado:', data)
      return data
    } catch (err) {
      console.error('❌ Error completo buscando cliente:', err)
      return null
    }
  }

  const createCustomer = async (customerData: CreateCustomerData): Promise<Customer | null> => {
    try {
      console.log('🔄 Creando cliente con datos:', customerData)
      
      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creando cliente:', error)
        throw error
      }
      
      console.log('✅ Cliente creado exitosamente:', data)
      
      // Update local state
      setCustomers(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('❌ Error completo creando cliente:', err)
      setError(err instanceof Error ? err.message : 'Error al crear cliente')
      return null
    }
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Update local state
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === id ? { ...customer, ...updates } : customer
        )
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cliente')
      return false
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return {
    customers,
    loading,
    error,
    lastRefresh,
    fetchCustomers,
    getCustomerByCedula,
    createCustomer,
    updateCustomer,
  }
}
