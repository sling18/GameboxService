import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook para suscribirse a cambios en tiempo real de una tabla
 * Solo actualiza cuando hay cambios reales en la base de datos
 */
export const useRealtimeSubscription = (
  table: string,
  callback: () => void | Promise<void>,
  enabled: boolean = true
) => {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const callbackRef = useRef(callback)

  // Actualizar la referencia del callback
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) {
      // Si está deshabilitado, desconectar
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      return
    }

    // Crear suscripción en tiempo real
    channelRef.current = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar INSERT, UPDATE, DELETE
          schema: 'public',
          table: table
        },
        (payload) => {
          console.log(`🔄 Cambio detectado en ${table}:`, payload.eventType)
          
          // Ejecutar callback cuando hay cambios
          const currentCallback = callbackRef.current
          if (currentCallback) {
            try {
              const result = currentCallback()
              if (result instanceof Promise) {
                result.catch((error) => {
                  console.error('Error en callback de real-time:', error)
                })
              }
            } catch (error) {
              console.error('Error en callback de real-time:', error)
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Estado de suscripción ${table}:`, status)
      })

    // Cleanup al desmontar
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [table, enabled])

  // Función para desconectar manualmente
  const disconnect = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
    }
  }

  return { disconnect }
}

/**
 * Hook específico para órdenes de servicio
 * Se actualiza solo cuando hay cambios en la tabla service_orders
 */
export const useServiceOrdersRealtime = (
  callback: () => void | Promise<void>,
  enabled: boolean = true
) => {
  return useRealtimeSubscription('service_orders', callback, enabled)
}

/**
 * Hook específico para clientes
 * Se actualiza solo cuando hay cambios en la tabla customers
 */
export const useCustomersRealtime = (
  callback: () => void | Promise<void>,
  enabled: boolean = true
) => {
  return useRealtimeSubscription('customers', callback, enabled)
}

/**
 * Hook específico para usuarios/perfiles
 * Se actualiza solo cuando hay cambios en la tabla profiles
 */
export const useProfilesRealtime = (
  callback: () => void | Promise<void>,
  enabled: boolean = true
) => {
  return useRealtimeSubscription('profiles', callback, enabled)
}