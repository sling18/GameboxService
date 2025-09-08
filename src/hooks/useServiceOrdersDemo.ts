import { useState, useEffect } from 'react'
import type { ServiceOrder, CreateServiceOrderData } from '../types'
import { demoServiceOrders } from '../data/demoData'
import { useAuth } from '../contexts/AuthContextDemo'

export const useServiceOrdersDemo = () => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchServiceOrders = async () => {
    try {
      setLoading(true)
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filteredOrders = [...demoServiceOrders]

      // Filtrar por rol de técnico
      if (user?.role === 'technician') {
        filteredOrders = demoServiceOrders.filter(order => 
          order.assigned_technician_id === user.id || order.status === 'pending'
        )
      }

      setServiceOrders(filteredOrders)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getServiceOrdersByCustomer = async (customerId: string): Promise<ServiceOrder[]> => {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      return demoServiceOrders.filter(order => order.customer_id === customerId)
    } catch (err) {
      console.error('Error fetching customer service orders:', err)
      return []
    }
  }

  const createServiceOrder = async (orderData: CreateServiceOrderData): Promise<ServiceOrder | null> => {
    try {
      if (!user) throw new Error('Usuario no autenticado')

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))

      const newOrder: ServiceOrder = {
        id: (serviceOrders.length + 1).toString(),
        ...orderData,
        priority: orderData.priority || 'medium',
        status: 'pending',
        assigned_technician_id: null,
        received_by_id: user.id,
        estimated_completion: null,
        completion_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        received_by: user,
      }
      
      // Actualizar estado local
      setServiceOrders(prev => [newOrder, ...prev])
      return newOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear orden de servicio')
      return null
    }
  }

  const updateServiceOrder = async (id: string, updates: Partial<ServiceOrder>): Promise<boolean> => {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300))

      // Actualizar estado local
      setServiceOrders(prev => 
        prev.map(order => 
          order.id === id ? { ...order, ...updates, updated_at: new Date().toISOString() } : order
        )
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar orden')
      return false
    }
  }

  const assignTechnician = async (orderId: string, technicianId: string): Promise<boolean> => {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300))

      const updates = {
        assigned_technician_id: technicianId,
        status: 'in_progress' as const,
        updated_at: new Date().toISOString(),
      }

      setServiceOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, ...updates } : order
        )
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar técnico')
      return false
    }
  }

  const completeServiceOrder = async (orderId: string, completionNotes: string): Promise<boolean> => {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300))

      const updates = {
        status: 'completed' as const,
        completion_notes: completionNotes,
        updated_at: new Date().toISOString(),
      }

      setServiceOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, ...updates } : order
        )
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al completar orden')
      return false
    }
  }

  useEffect(() => {
    if (user) {
      fetchServiceOrders()
    }
  }, [user])

  return {
    serviceOrders,
    loading,
    error,
    fetchServiceOrders,
    getServiceOrdersByCustomer,
    createServiceOrder,
    updateServiceOrder,
    assignTechnician,
    completeServiceOrder,
  }
}
