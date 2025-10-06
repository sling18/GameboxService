import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { ServiceOrder, CreateServiceOrderData, CreateMultipleDeviceOrderData } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { generateOrderNumberSimple } from '../utils/orderNumber'
import { useServiceOrdersRealtime } from './useRealtimeSubscription'

export const useServiceOrders = (autoRefresh: boolean = true) => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const { user } = useAuth()

  const fetchServiceOrders = async () => {
    // No hacer fetch si no hay usuario autenticado
    if (!user) {
      console.log('🚫 No hay usuario autenticado, saltando fetch de órdenes')
      return
    }

    try {
      setLoading(true)
      // Consulta completa con todas las relaciones de técnicos
      let query = supabase
        .from('service_orders')
        .select(`
          *,
          customer:customers(*),
          assigned_technician:profiles!service_orders_assigned_technician_id_fkey(*),
          completed_by:profiles!service_orders_completed_by_id_fkey(*),
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
      setLastRefresh(new Date())
      console.log('🔄 Órdenes de servicio actualizadas:', data?.length || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('❌ Error fetching service orders:', err)
    } finally {
      setLoading(false)
    }
  }

  // Real-time subscription - Solo si hay usuario autenticado
  const { disconnect } = useServiceOrdersRealtime(
    fetchServiceOrders,
    autoRefresh && !!user // Solo real-time si está habilitado y hay usuario
  )

  // Cleanup real-time subscription when user logs out
  useEffect(() => {
    if (!user) {
      disconnect()
      setServiceOrders([]) // Clear data when user logs out
      setError(null)
      setLoading(false)
    }
  }, [user, disconnect])

  const getServiceOrdersByCustomer = async (customerId: string): Promise<ServiceOrder[]> => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          customer:customers(*),
          assigned_technician:profiles!service_orders_assigned_technician_id_fkey(*),
          completed_by:profiles!service_orders_completed_by_id_fkey(*),
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

      // Generar número de orden único
      const orderNumber = generateOrderNumberSimple()

      const orderToInsert = {
        ...orderData,
        order_number: orderNumber,
        received_by_id: user.id,
      }

      console.log('🔄 Creando orden de servicio con datos:', orderToInsert)

      // Primero insertar sin select complejo
      const { data: insertedOrder, error: insertError } = await supabase
        .from('service_orders')
        .insert(orderToInsert)
        .select('*')
        .single()

      if (insertError) {
        console.error('❌ Error insertando orden:', insertError)
        throw insertError
      }

      console.log('✅ Orden insertada exitosamente:', insertedOrder)

      // Luego obtener la orden completa con las relaciones
      const { data: completeOrder, error: fetchError } = await supabase
        .from('service_orders')
        .select(`
          *,
          customer:customers(*),
          assigned_technician:profiles!service_orders_assigned_technician_id_fkey(*),
          completed_by:profiles!service_orders_completed_by_id_fkey(*),
          received_by:profiles!service_orders_received_by_id_fkey(*)
        `)
        .eq('id', insertedOrder.id)
        .single()

      if (fetchError) {
        console.warn('⚠️ Error obteniendo orden completa:', fetchError)
        // Si falla el fetch completo, usar la orden básica
        const basicOrder = {
          ...insertedOrder,
          customer: null,
          assigned_technician: null,
          received_by: null
        }
        setServiceOrders(prev => [basicOrder as ServiceOrder, ...prev])
        return basicOrder as ServiceOrder
      }

      // Update local state
      setServiceOrders(prev => [completeOrder, ...prev])
      return completeOrder
    } catch (err) {
      console.error('❌ Error completo:', err)
      setError(err instanceof Error ? err.message : 'Error al crear orden de servicio')
      return null
    }
  }

  const createMultipleDeviceOrder = async (orderData: CreateMultipleDeviceOrderData): Promise<ServiceOrder[]> => {
    try {
      if (!user) throw new Error('Usuario no autenticado')
      if (!orderData.devices || orderData.devices.length === 0) {
        throw new Error('Debe agregar al menos un dispositivo')
      }

      console.log('🔄 Creando múltiples órdenes de servicio:', orderData.devices.length, 'dispositivos')

      const createdOrders: ServiceOrder[] = []

      // Crear una orden por cada dispositivo
      for (const device of orderData.devices) {
        const orderNumber = generateOrderNumberSimple()

        const orderToInsert = {
          customer_id: orderData.customer_id,
          device_type: device.device_type,
          device_brand: device.device_brand,
          device_model: device.device_model,
          serial_number: device.serial_number || null,
          problem_description: device.problem_description,
          observations: device.observations || null,
          order_number: orderNumber,
          received_by_id: user.id,
        }

        // Insertar la orden
        const { data: insertedOrder, error: insertError } = await supabase
          .from('service_orders')
          .insert(orderToInsert)
          .select('*')
          .single()

        if (insertError) {
          console.error('❌ Error insertando orden:', insertError)
          throw insertError
        }

        // Obtener la orden completa con relaciones
        const { data: completeOrder, error: fetchError } = await supabase
          .from('service_orders')
          .select(`
            *,
            customer:customers(*),
            assigned_technician:profiles!service_orders_assigned_technician_id_fkey(*),
            completed_by:profiles!service_orders_completed_by_id_fkey(*),
            received_by:profiles!service_orders_received_by_id_fkey(*)
          `)
          .eq('id', insertedOrder.id)
          .single()

        if (fetchError) {
          console.warn('⚠️ Error obteniendo orden completa:', fetchError)
          const basicOrder = {
            ...insertedOrder,
            customer: null,
            assigned_technician: null,
            received_by: null
          }
          createdOrders.push(basicOrder as ServiceOrder)
        } else {
          createdOrders.push(completeOrder)
        }
      }

      // Update local state con todas las órdenes nuevas
      setServiceOrders(prev => [...createdOrders, ...prev])
      
      console.log('✅ Órdenes múltiples creadas exitosamente:', createdOrders.length)
      return createdOrders
    } catch (err) {
      console.error('❌ Error creando órdenes múltiples:', err)
      setError(err instanceof Error ? err.message : 'Error al crear órdenes de servicio')
      return []
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
      if (!user) throw new Error('Usuario no autenticado')
      
      const { error } = await supabase
        .from('service_orders')
        .update({
          status: 'completed',
          completion_notes: completionNotes,
          completed_by_id: user.id,
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

  const deliverServiceOrder = async (orderId: string, deliveryNotes?: string): Promise<boolean> => {
    try {
      console.log('📦 Marcando orden como entregada:', orderId)
      
      const now = new Date().toISOString()
      
      const { error } = await supabase
        .from('service_orders')
        .update({
          status: 'delivered',
          delivered_at: now,
          delivery_notes: deliveryNotes || null,
          updated_at: now,
        })
        .eq('id', orderId)

      if (error) throw error

      console.log('✅ Orden marcada como entregada exitosamente')
      console.log(`� Fecha de entrega registrada: ${now}`)
      if (deliveryNotes) {
        console.log(`📝 Notas de entrega: ${deliveryNotes}`)
      }
      
      // Refresh data
      await fetchServiceOrders()
      return true
    } catch (err) {
      console.error('❌ Error marcando orden como entregada:', err)
      setError(err instanceof Error ? err.message : 'Error al entregar orden')
      return false
    }
  }

  const deleteServiceOrder = async (orderId: string): Promise<boolean> => {
    try {
      console.log('🗑️ Eliminando orden de servicio:', orderId)
      
      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', orderId)

      if (error) throw error

      // Update local state by removing the deleted order
      setServiceOrders(prev => prev.filter(order => order.id !== orderId))
      
      console.log('✅ Orden eliminada exitosamente')
      return true
    } catch (err) {
      console.error('❌ Error eliminando orden:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar orden')
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
    lastRefresh,
    fetchServiceOrders,
    getServiceOrdersByCustomer,
    createServiceOrder,
    createMultipleDeviceOrder,
    updateServiceOrder,
    assignTechnician,
    completeServiceOrder,
    deliverServiceOrder,
    deleteServiceOrder,
  }
}
