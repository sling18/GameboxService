/**
 * Manejador centralizado de errores
 * Evita exponer información sensible al usuario en producción
 */

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  timestamp?: Date
}

/**
 * Maneja errores de forma segura
 * En desarrollo muestra detalles, en producción mensajes genéricos
 */
export const handleError = (
  error: unknown,
  context?: string | ErrorContext
): string => {
  const timestamp = new Date().toISOString()
  const contextStr = typeof context === 'string' ? context : context?.component || 'unknown'

  // Log completo en consola (siempre)
  console.error(`❌ Error ${contextStr ? `in ${contextStr}` : ''} [${timestamp}]:`, error)

  // Si hay contexto adicional, loggearlo
  if (typeof context === 'object') {
    console.error('Context:', context)
  }

  // Mensaje para el usuario
  let userMessage = 'Ocurrió un error inesperado. Por favor intenta nuevamente.'

  // En desarrollo, mostrar más detalles
  if (import.meta.env.DEV) {
    if (error instanceof Error) {
      userMessage = `[DEV] ${error.message}`
      
      // Si hay stack trace, mostrarlo en consola
      if (error.stack) {
        console.error('Stack:', error.stack)
      }
    } else {
      userMessage = `[DEV] ${String(error)}`
    }
  } else {
    // En producción, mensajes más amigables según el tipo de error
    if (error instanceof Error) {
      // Errores de red
      if (error.message.includes('fetch') || error.message.includes('network')) {
        userMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.'
      }
      // Errores de autenticación
      else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
        userMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.'
      }
      // Errores de validación
      else if (error.message.includes('validation') || error.message.includes('invalid')) {
        userMessage = 'Datos inválidos. Verifica la información e intenta nuevamente.'
      }
    }
  }

  return userMessage
}

/**
 * Maneja errores de forma asíncrona con callback opcional
 */
export const handleAsyncError = async (
  fn: () => Promise<void>,
  context?: string | ErrorContext,
  onError?: (message: string) => void
): Promise<boolean> => {
  try {
    await fn()
    return true
  } catch (error) {
    const message = handleError(error, context)
    if (onError) {
      onError(message)
    }
    return false
  }
}

/**
 * Wrapper para funciones que pueden lanzar errores
 */
export const tryCatch = <T>(
  fn: () => T,
  fallback: T,
  context?: string | ErrorContext
): T => {
  try {
    return fn()
  } catch (error) {
    handleError(error, context)
    return fallback
  }
}

/**
 * Log de información (no errores)
 */
export const logInfo = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.log(`ℹ️ ${message}`, data || '')
  }
}

/**
 * Log de advertencia
 */
export const logWarning = (message: string, data?: any) => {
  console.warn(`⚠️ ${message}`, data || '')
}
