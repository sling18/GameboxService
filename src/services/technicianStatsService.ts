/**
 * Servicio para gestión de estadísticas de técnicos
 * Capa de servicios - Arquitectura Limpia
 */

import { supabase } from '../lib/supabase'
import type { ServiceOrder, User as UserType } from '../types'

export interface TechnicianStats {
  id: string
  full_name: string
  email: string
  totalCompleted: number
  thisWeek: number
  thisMonth: number
  thisYear: number
  completedOrders: ServiceOrder[]
  inProgressOrders: ServiceOrder[]
  avgCompletionTime: number
  totalRevenue: number
}

/**
 * Obtiene todos los técnicos activos
 */
export const fetchTechnicians = async (): Promise<UserType[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'technician')
      .order('full_name')

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('❌ Error cargando técnicos:', err)
    throw err
  }
}

/**
 * Obtiene todas las órdenes completadas con información del técnico que las completó
 * NOTA: Si completed_by_id es NULL, usa assigned_technician_id como fallback
 */
export const fetchCompletedOrders = async (): Promise<ServiceOrder[]> => {
  try {
    console.log('🔍 Obteniendo órdenes completadas...')
    
    const { data, error } = await supabase
      .from('service_orders')
      .select(`
        *,
        customer:customers(*),
        assigned_technician:profiles!service_orders_assigned_technician_id_fkey(*),
        completed_by:profiles!service_orders_completed_by_id_fkey(*),
        received_by:profiles!service_orders_received_by_id_fkey(*)
      `)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })

    if (error) throw error
    
    console.log(`✅ ${data?.length || 0} órdenes completadas encontradas`)
    console.log('📊 Análisis de completed_by_id:')
    console.log('   - Con completed_by_id:', data?.filter(o => o.completed_by_id).length)
    console.log('   - Sin completed_by_id:', data?.filter(o => !o.completed_by_id).length)
    console.log('📊 Primeras 3 órdenes:', data?.slice(0, 3).map(o => ({
      order_number: o.order_number,
      assigned_technician_id: o.assigned_technician_id,
      completed_by_id: o.completed_by_id,
      assigned_tech_name: o.assigned_technician?.full_name || o.assigned_technician?.email,
      completed_by_name: o.completed_by?.full_name || o.completed_by?.email
    })))
    
    return data || []
  } catch (err) {
    console.error('❌ Error obteniendo órdenes completadas:', err)
    throw err
  }
}

/**
 * Obtiene todas las órdenes en progreso
 */
export const fetchInProgressOrders = async (): Promise<ServiceOrder[]> => {
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
      .eq('status', 'in_progress')
      .not('assigned_technician_id', 'is', null)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('❌ Error obteniendo órdenes en progreso:', err)
    throw err
  }
}

/**
 * Calcula estadísticas para un técnico específico
 * LÓGICA: Usa completed_by_id si existe, sino usa assigned_technician_id
 */
export const calculateTechnicianStats = (
  technician: UserType,
  completedOrders: ServiceOrder[],
  inProgressOrders: ServiceOrder[]
): TechnicianStats => {
  // Filtrar órdenes completadas por este técnico
  // FALLBACK: Si completed_by_id es NULL, usar assigned_technician_id
  const techCompletedOrders = completedOrders.filter(order => {
    const completedBy = order.completed_by_id || order.assigned_technician_id
    return completedBy === technician.id
  })
  
  // Filtrar órdenes en progreso de este técnico
  const techInProgressOrders = inProgressOrders.filter(
    order => order.assigned_technician_id === technician.id
  )

  console.log(`📊 Técnico: ${technician.full_name || technician.email}`)
  console.log(`   - Completadas: ${techCompletedOrders.length}`)
  console.log(`   - En progreso: ${techInProgressOrders.length}`)
  if (techCompletedOrders.length > 0) {
    console.log(`   - Desglose completadas:`)
    console.log(`     • Con completed_by_id: ${techCompletedOrders.filter(o => o.completed_by_id === technician.id).length}`)
    console.log(`     • Con assigned (fallback): ${techCompletedOrders.filter(o => !o.completed_by_id && o.assigned_technician_id === technician.id).length}`)
  }

  // Calcular estadísticas por período
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

  const thisWeek = techCompletedOrders.filter(order => 
    new Date(order.updated_at) >= oneWeekAgo
  ).length

  const thisMonth = techCompletedOrders.filter(order => 
    new Date(order.updated_at) >= oneMonthAgo
  ).length

  const thisYear = techCompletedOrders.filter(order => 
    new Date(order.updated_at) >= oneYearAgo
  ).length

  // Calcular tiempo promedio de finalización
  const avgCompletionTime = techCompletedOrders.length > 0 
    ? techCompletedOrders.reduce((sum, order) => {
        const created = new Date(order.created_at)
        const completed = new Date(order.updated_at)
        return sum + (completed.getTime() - created.getTime())
      }, 0) / techCompletedOrders.length / (1000 * 60 * 60 * 24) // días
    : 0

  return {
    id: technician.id,
    full_name: technician.full_name || technician.email?.split('@')[0] || 'Técnico',
    email: technician.email,
    totalCompleted: techCompletedOrders.length,
    thisWeek,
    thisMonth,
    thisYear,
    completedOrders: techCompletedOrders,
    inProgressOrders: techInProgressOrders,
    avgCompletionTime,
    totalRevenue: techCompletedOrders.length * 15000 // Estimado
  }
}

/**
 * Obtiene estadísticas completas de todos los técnicos
 */
export const fetchTechnicianStatistics = async (): Promise<TechnicianStats[]> => {
  try {
    console.log('🔄 Iniciando carga de estadísticas de técnicos...')
    
    // Cargar datos en paralelo para mejor performance
    const [technicians, completedOrders, inProgressOrders] = await Promise.all([
      fetchTechnicians(),
      fetchCompletedOrders(),
      fetchInProgressOrders()
    ])

    console.log(`✅ Datos cargados:`)
    console.log(`   - ${technicians.length} técnicos`)
    console.log(`   - ${completedOrders.length} órdenes completadas`)
    console.log(`   - ${inProgressOrders.length} órdenes en progreso`)

    // Calcular estadísticas para cada técnico
    const stats = technicians.map(tech => 
      calculateTechnicianStats(tech, completedOrders, inProgressOrders)
    )

    // Ordenar por total de reparaciones completadas (descendente)
    stats.sort((a, b) => b.totalCompleted - a.totalCompleted)

    console.log('✅ Estadísticas calculadas exitosamente')
    return stats
  } catch (err) {
    console.error('❌ Error obteniendo estadísticas de técnicos:', err)
    throw err
  }
}
