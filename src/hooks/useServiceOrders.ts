import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { ServiceOrder, CreateServiceOrderData } from '../types'
import { useAuth } from '../contexts/AuthContext'

export const useServiceOrders = () => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchServiceOrders = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('service_orders')
        .select(`
          *,
          customer:customers(*),
          assigned_technician:profiles!service_orders_assigned_technician_id_fkey(*),
          received_by:profiles!service_orders_received_by_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      // Filter by technician role
      if (user?.role === 'technician') {
        query = query.or(`assigned_technician_id.eq.${user.id},status.eq.pending`)
      }

      const { data, error } = await query

      if (error) throw error
      setServiceOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getServiceOrdersByCustomer = async (customerId: string): Promise<ServiceOrder[]> => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          customer:customers(*),
          assigned_technician:profiles!service_orders_assigned_technician_id_fkey(*),
          received_by:profiles!service_orders_received_by_id_fkey(*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching customer service orders:', err)
      return []
    }
  }

  const createServiceOrder = async (orderData: CreateServiceOrderData): Promise<ServiceOrder | null> => {
    try {
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('service_orders')
        .insert({
          ...orderData,
          received_by_id: user.id,
        })
        .select(`
          *,
          customer:customers(*),
          assigned_technician:profiles!service_orders_assigned_technician_id_fkey(*),
          received_by:profiles!service_orders_received_by_id_fkey(*)
        `)
        .single()

      if (error) throw error
      
      // Update local state
      setServiceOrders(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear orden de servicio')
      return null
    }
  }

  const updateServiceOrder = async (id: string, updates: Partial<ServiceOrder>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Update local state
      setServiceOrders(prev => 
        prev.map(order => 
          order.id === id ? { ...order, ...updates } : order
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
      const { error } = await supabase
        .from('service_orders')
        .update({
          assigned_technician_id: technicianId,
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) throw error

      // Refresh data
      await fetchServiceOrders()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar técnico')
      return false
    }
  }

  const completeServiceOrder = async (orderId: string, completionNotes: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({
          status: 'completed',
          completion_notes: completionNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) throw error

      // Refresh data
      await fetchServiceOrders()
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
