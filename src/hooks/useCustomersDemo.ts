import { useState, useEffect } from 'react'
import type { Customer, CreateCustomerData } from '../types'
import { demoCustomers } from '../data/demoData'

export const useCustomersDemo = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))
      setCustomers([...demoCustomers])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getCustomerByCedula = async (cedula: string): Promise<Customer | null> => {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const customer = demoCustomers.find(c => c.cedula === cedula)
      return customer || null
    } catch (err) {
      console.error('Error fetching customer:', err)
      return null
    }
  }

  const createCustomer = async (customerData: CreateCustomerData): Promise<Customer | null> => {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const newCustomer: Customer = {
        id: (customers.length + 1).toString(),
        ...customerData,
        phone: customerData.phone || null,
        email: customerData.email || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      // Actualizar estado local
      setCustomers(prev => [newCustomer, ...prev])
      return newCustomer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente')
      return null
    }
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<boolean> => {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300))

      // Actualizar estado local
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === id ? { ...customer, ...updates, updated_at: new Date().toISOString() } : customer
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
