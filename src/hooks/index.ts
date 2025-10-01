/**
 * Central barrel export for all custom hooks
 * This makes imports cleaner throughout the application
 */

// Auto-refresh functionality
export { useAutoRefresh } from './useAutoRefresh'

// Data hooks
export { useCustomers } from './useCustomers'
export { useServiceOrders } from './useServiceOrders'
export { useUsers } from './useUsers'

// Realtime functionality
export { useRealtimeSubscription } from './useRealtimeSubscription'

// Image processing
export { useImageToBase64 } from './useImageToBase64'
