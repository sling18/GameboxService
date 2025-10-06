/**
 * Script temporal para corregir fechas de entrega
 * Ejecutar SOLO UNA VEZ desde la consola del navegador
 */

import { supabase } from '../lib/supabase'

export const fixDeliveredDates = async () => {
  try {
    console.log('🔧 Iniciando corrección de fechas de entrega...')
    
    // 1. Obtener todas las órdenes entregadas sin delivered_at
    const { data: ordersToFix, error: fetchError } = await supabase
      .from('service_orders')
      .select('id, order_number, status, updated_at, delivered_at')
      .eq('status', 'delivered')
      .is('delivered_at', null)
    
    if (fetchError) throw fetchError
    
    console.log(`📊 Encontradas ${ordersToFix?.length || 0} órdenes a corregir`)
    
    if (!ordersToFix || ordersToFix.length === 0) {
      console.log('✅ No hay órdenes que necesiten corrección')
      return { success: true, fixed: 0 }
    }
    
    // 2. Mostrar preview de las órdenes a corregir
    console.table(ordersToFix.map(o => ({
      Orden: o.order_number,
      'Updated At': o.updated_at,
      'Delivered At': o.delivered_at || 'NULL'
    })))
    
    // 3. Actualizar cada orden
    let fixed = 0
    for (const order of ordersToFix) {
      const { error: updateError } = await supabase
        .from('service_orders')
        .update({ delivered_at: order.updated_at })
        .eq('id', order.id)
      
      if (updateError) {
        console.error(`❌ Error actualizando orden ${order.order_number}:`, updateError)
      } else {
        console.log(`✅ ${order.order_number}: delivered_at = ${order.updated_at}`)
        fixed++
      }
    }
    
    console.log(`\n🎉 Corrección completada: ${fixed}/${ordersToFix.length} órdenes actualizadas`)
    console.log('🔄 Recarga la página para ver las estadísticas actualizadas')
    
    return { success: true, fixed }
  } catch (error) {
    console.error('❌ Error en corrección de fechas:', error)
    return { success: false, error }
  }
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  (window as any).fixDeliveredDates = fixDeliveredDates
}
