import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Customer, CreateCustomerData } from '../types'

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getCustomerByCedula = async (cedula: string): Promise<Customer | null> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('cedula', cedula)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No customer found
        }
        throw error
      }
      return data
    } catch (err) {
      console.error('Error fetching customer:', err)
      return null
    }
  }

  const createCustomer = async (customerData: CreateCustomerData): Promise<Customer | null> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single()

      if (error) throw error
      
      // Update local state
      setCustomers(prev => [data, ...prev])
      return data
    } catch (err) {
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
    fetchCustomers,
    getCustomerByCedula,
    createCustomer,
    updateCustomer,
  }
}
