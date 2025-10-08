import React, { useState } from 'react'
import { useServiceOrders } from '../hooks/useServiceOrders'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from '../contexts/RouterContext'
import { Clock, User, CheckCircle, Package, Plus, Wrench, Calendar, Printer } from 'lucide-react'
import AutoRefreshIndicator from './AutoRefreshIndicator'
import ComandaPreview from './ComandaPreview'
import { CustomModal } from './ui/CustomModal'
import { supabase } from '../lib/supabase'

interface ModalState {
  isOpen: boolean
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  title: string
  message: string
  onConfirm?: () => void
  showCancel?: boolean
  confirmText?: string
}

const ServiceQueue: React.FC = () => {
  const { serviceOrders, loading, updateServiceOrder, completeServiceOrder, deliverServiceOrder } = useServiceOrders(true) // Enable auto-refresh
  const { user } = useAuth()
  const { navigate } = useRouter()
  
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  })
  
  const [completionNotes, setCompletionNotes] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [currentAction, setCurrentAction] = useState<'complete' | 'deliver' | null>(null)
  
  // Estados para la comanda de impresión
  const [showComandaFor, setShowComandaFor] = useState<{order: any, customer: any} | null>(null)

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }))
    setCurrentAction(null)
    setCompletionNotes('')
    setDeliveryNotes('')
  }

  const showSuccessModal = (message: string) => {
    setModal({
      isOpen: true,
      type: 'success',
      title: '¡Éxito!',
      message
    })
  }

  const showErrorModal = (message: string) => {
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Error',
      message
    })
  }

  // Función para obtener detalles completos de la orden para la comanda
  const getOrderForComanda = async (orderId: string) => {
    try {
      console.log('🔍 Consultando orden para comanda:', orderId)
      
      const { data: order, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          customer:customers(*),
          assigned_technician:profiles!service_orders_assigned_technician_id_fkey(*),
          completed_by:profiles!service_orders_completed_by_id_fkey(*),
          received_by:profiles!service_orders_received_by_id_fkey(*)
        `)
        .eq('id', orderId)
        .single()
      
      if (error) {
        console.error('❌ Error en consulta de comanda:', error)
        throw error
      }
      
      if (!order.customer) {
        console.error('❌ Customer no encontrado en la orden:', orderId)
        throw new Error('No se encontró información del cliente')
      }
      
      console.log('✅ Orden completa obtenida para comanda:', order)
      return order
    } catch (error) {
      console.error('❌ Error general obteniendo orden para comanda:', error)
      return null
    }
  }

  const handlePrintComanda = async (orderId: string) => {
    console.log('📋 Iniciando impresión de comanda para orden:', orderId)
    
    try {
      const order = await getOrderForComanda(orderId)
      if (order && order.customer) {
        console.log('✅ Abriendo comanda con datos completos')
        setShowComandaFor({ order, customer: order.customer })
      } else {
        console.error('❌ No se pudieron obtener datos completos de la orden')
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Error al Cargar Comanda',
          message: 'No se pudo cargar la información de la orden para la comanda. Verifique que la orden tenga datos de cliente asociados.'
        })
      }
    } catch (error) {
      console.error('❌ Error en handlePrintComanda:', error)
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error al Cargar Comanda',
        message: 'Ocurrió un problema técnico al cargar la información de la orden. Por favor, intente nuevamente.'
      })
    }
  }

  const handleTakeOrder = async (orderId: string) => {
    if (!user) return
    
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Confirmar Acción',
      message: '¿Estás seguro de que quieres tomar esta reparación?',
      showCancel: true,
      confirmText: 'Sí, tomar',
      onConfirm: async () => {
        try {
          await updateServiceOrder(orderId, { 
            assigned_technician_id: user.id,
            status: 'in_progress' 
          })
          showSuccessModal('Reparación tomada exitosamente')
        } catch (error) {
          showErrorModal('Error al tomar la reparación')
        }
        closeModal()
      }
    })
  }

  const handleCompleteOrder = (orderId: string) => {
    setCurrentAction('complete')
    setCompletionNotes('')
    
    setModal({
      isOpen: true,
      type: 'info',
      title: 'Completar Reparación',
      message: 'Describe el trabajo realizado en la reparación:',
      showCancel: true,
      confirmText: 'Completar Reparación',
      onConfirm: async () => {
        try {
          console.log('🔧 Completando orden con notas:', {
            orderId,
            completionNotes: completionNotes.trim(),
            length: completionNotes.trim().length
          })
          
          await completeServiceOrder(orderId, completionNotes.trim())
          showSuccessModal('Reparación completada exitosamente')
        } catch (error) {
          console.error('❌ Error al completar:', error)
          showErrorModal('Error al completar la reparación')
        }
        closeModal()
      }
    })
  }

  const handleDeliverOrder = (orderId: string) => {
    setCurrentAction('deliver')
    setDeliveryNotes('')
    
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Confirmar Entrega',
      message: '¿Confirmas que el cliente ha recogido su artículo? Puedes agregar notas opcionales:',
      showCancel: true,
      confirmText: 'Confirmar Entrega',
      onConfirm: async () => {
        try {
          await deliverServiceOrder(orderId, deliveryNotes.trim())
          showSuccessModal('Artículo entregado exitosamente al cliente')
        } catch (error) {
          showErrorModal('Error al registrar la entrega')
        }
        closeModal()
      }
    })
  }

  const getOrdersByStatus = (status: string) => {
    return serviceOrders.filter(order => {
      if (user?.role === 'technician') {
        if (status === 'pending') {
          return order.status === 'pending'
        }
        return order.status === status && order.assigned_technician_id === user.id
      }
      return order.status === status
    })
  }

  const StatusSection: React.FC<{ title: string; status: string; icon: any; color: string }> = ({ 
    title, 
    status, 
    icon: Icon, 
    color 
  }) => {
    const orders = getOrdersByStatus(status)
    const [currentPage, setCurrentPage] = React.useState(1)
    const ordersPerPage = 3
    
    // Calcular órdenes a mostrar
    const indexOfLastOrder = currentPage * ordersPerPage
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)
    const totalPages = Math.ceil(orders.length / ordersPerPage)
    
    // Resetear página cuando cambien las órdenes
    React.useEffect(() => {
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages)
      }
    }, [orders.length, currentPage, totalPages])
    
    return (
      <div className="col-12 col-sm-6 col-lg-6 col-xl-3 mb-3 mb-sm-4">
        <div className="card border-0 shadow-sm h-100 d-flex flex-column">
          <div className="card-header bg-transparent border-0 py-2 py-sm-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className={`bg-${color} bg-opacity-10 rounded-circle p-2 me-2`}>
                  <Icon size={18} className={`text-${color}`} />
                </div>
                <h6 className="mb-0 fw-semibold">{title}</h6>
              </div>
              <span className={`badge bg-${color}`}>{orders.length}</span>
            </div>
          </div>
          
          <div className="card-body p-0 flex-grow-1 d-flex flex-column">
            {orders.length === 0 ? (
              <div className="text-center py-4">
                <div className={`bg-${color} bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3`}>
                  <Icon size={32} className={`text-${color}`} />
                </div>
                <h6 className="text-muted">Sin órdenes {title.toLowerCase()}</h6>
              </div>
            ) : (
              <>
                <div className="p-2 p-sm-3 flex-grow-1">
                  {currentOrders.map(order => (
                  <div key={order.id} className="card bg-light border-0 mb-2">
                    <div className="card-body p-2 p-sm-3">
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2 mb-2">
                        <div className="flex-grow-1 min-w-0" style={{ maxWidth: '55%' }}>
                          <h6 className="fw-bold mb-1" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: '1.3' }}>
                            {order.device_brand} {order.device_model}
                          </h6>
                          <small className="text-muted d-block text-truncate">
                            {order.customer?.full_name}
                          </small>
                          <small className="text-primary d-block fw-semibold">
                            #{order.order_number}
                          </small>
                        </div>
                        <div className="d-flex align-items-start text-muted" style={{ maxWidth: '45%' }}>
                          <Package className="w-3 h-3 me-1 flex-shrink-0 mt-1" />
                          <small style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {order.device_type}
                            {order.serial_number && (
                              <span className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                                SN: {order.serial_number}
                              </span>
                            )}
                          </small>
                        </div>
                      </div>
                      
                      <p className="small text-muted mb-2 text-truncate">
                        {order.problem_description}
                      </p>
                      
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          <Calendar size={12} className="me-1" />
                          {new Date(order.created_at).toLocaleDateString('es-ES')}
                        </small>
                      </div>
                      
                      {user?.role === 'technician' && (
                        <div className="d-grid gap-1">
                          {status === 'pending' && (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleTakeOrder(order.id)}
                              style={{minHeight: '44px'}}
                            >
                              <Wrench size={16} className="me-1" />
                              <span className="d-none d-sm-inline">Tomar Reparación</span>
                              <span className="d-inline d-sm-none">Tomar</span>
                            </button>
                          )}
                          {status === 'in_progress' && (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleCompleteOrder(order.id)}
                              style={{minHeight: '44px'}}
                            >
                              <CheckCircle size={16} className="me-1" />
                              <span className="d-none d-sm-inline">Completar</span>
                              <span className="d-inline d-sm-none">✓</span>
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Botón de entrega para admin y recepcionista en órdenes completadas */}
                      {(user?.role === 'admin' || user?.role === 'receptionist') && status === 'completed' && (
                        <div className="d-grid gap-1 mt-2">
                          <button 
                            className="btn btn-outline-success btn-sm border-2"
                            onClick={() => handleDeliverOrder(order.id)}
                            style={{minHeight: '44px'}}
                          >
                            <Package size={16} className="me-1" />
                            <span className="d-none d-sm-inline">✅ Cliente Recoge Artículo</span>
                            <span className="d-inline d-sm-none">✅ Entregar</span>
                          </button>
                        </div>
                      )}

                      {/* Botón de imprimir comanda para admin y recepcionista */}
                      {(user?.role === 'admin' || user?.role === 'receptionist') && (
                        <div className="d-grid gap-1 mt-2">
                          <button 
                            className="btn btn-outline-info btn-sm"
                            onClick={() => handlePrintComanda(order.id)}
                            style={{minHeight: '44px'}}
                          >
                            <Printer size={16} className="me-1" />
                            <span className="d-none d-sm-inline">Imprimir Comanda</span>
                            <span className="d-inline d-sm-none">Comanda</span>
                          </button>
                        </div>
                      )}
                      
                      {order.assigned_technician && status !== 'pending' && (
                        <div className="mt-2 pt-2 border-top">
                          <small className="text-muted">
                            <User size={12} className="me-1" />
                            {status === 'completed' && order.completed_by ? (
                              <>
                                <span className="text-success fw-semibold">
                                  {order.completed_by?.full_name || 
                                   order.completed_by?.email?.split('@')[0] || 
                                   'Técnico'}
                                </span>
                                <span className="text-muted"> (Finalizado)</span>
                              </>
                            ) : (
                              <>
                                {order.assigned_technician?.full_name || 
                                 order.assigned_technician?.email?.split('@')[0] || 
                                 'Técnico'}
                                <span className="text-muted"> (Asignado)</span>
                              </>
                            )}
                          </small>
                        </div>
                      )}
                      
                      {order.completion_notes && (
                        <div className="mt-2 pt-2 border-top">
                          <small className="text-success">
                            <strong>Notas de reparación:</strong> {order.completion_notes}
                          </small>
                        </div>
                      )}
                      
                      {order.delivery_notes && status === 'delivered' && (
                        <div className="mt-2 pt-2 border-top">
                          <small className="text-warning">
                            <strong>Notas de entrega:</strong> {order.delivery_notes}
                          </small>
                        </div>
                      )}
                      
                      {order.delivered_at && status === 'delivered' && (
                        <div className="mt-2 pt-2 border-top">
                          <small className="text-muted">
                            <Package size={12} className="me-1" />
                            Entregado: {new Date(order.delivered_at).toLocaleString('es-ES')}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Paginación touch-friendly */}
              {orders.length > ordersPerPage && (
                <div className="card-footer bg-transparent border-top py-2 py-sm-3">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
                    <small className="text-muted text-center text-sm-start order-2 order-sm-1">
                      {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, orders.length)} de {orders.length}
                    </small>
                    <div className="d-flex align-items-center gap-2 order-1 order-sm-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="btn btn-outline-primary btn-sm"
                        style={{minWidth: '44px', minHeight: '44px'}}
                        aria-label="Página anterior"
                      >
                        <span className="d-none d-sm-inline">‹ Anterior</span>
                        <span className="d-inline d-sm-none">‹</span>
                      </button>
                      <span className="text-muted small">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="btn btn-outline-primary btn-sm"
                        style={{minWidth: '44px', minHeight: '44px'}}
                        aria-label="Página siguiente"
                      >
                        <span className="d-none d-sm-inline">Siguiente ›</span>
                        <span className="d-inline d-sm-none">›</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-3">
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '50vh'}}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="text-muted">Cargando órdenes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-3">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{background: user?.role === 'technician' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <div className="card-body text-white p-3 p-md-4">
              <div className="row align-items-center">
                <div className="col-md-9">
                  <h1 className="h4 fw-bold mb-2">
                    {user?.role === 'technician' ? 'Cola de Reparaciones' : 'Órdenes de Servicio'}
                  </h1>
                  <p className="mb-0 opacity-90">
                    {user?.role === 'technician' ? 'Gestiona tus reparaciones asignadas' : 'Vista completa de todas las órdenes'}
                  </p>
                  <small className="opacity-75">
                    {user?.role === 'technician' ? 'Toma y completa reparaciones' : 'Seguimiento en tiempo real'}
                  </small>
                </div>
                <div className="col-md-3 text-end d-none d-md-block">
                  {user?.role === 'technician' ? (
                    <Wrench size={60} className="opacity-25" />
                  ) : (
                    <Package size={60} className="opacity-25" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action button */}
      {(user?.role === 'admin' || user?.role === 'receptionist') && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="text-end">
              <button 
                onClick={() => navigate('create-order')} 
                className="btn btn-primary d-flex align-items-center ms-auto"
              >
                <Plus size={16} className="me-2" />
                Nueva Orden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics row */}
      <div className="row g-2 g-sm-3 mb-3 mb-sm-4">
        <div className="col-6 col-sm-6 col-md-3">
          <div className="card bg-warning bg-opacity-10 border-0" style={{minHeight: '110px'}}>
            <div className="card-body text-center p-2 p-sm-3 d-flex flex-column justify-content-center">
              <Clock size={28} className="text-warning mb-2" />
              <h5 className="fw-bold text-warning mb-1">{getOrdersByStatus('pending').length}</h5>
              <small className="text-muted">Pendientes</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-6 col-md-3">
          <div className="card bg-info bg-opacity-10 border-0" style={{minHeight: '110px'}}>
            <div className="card-body text-center p-2 p-sm-3 d-flex flex-column justify-content-center">
              <User size={28} className="text-info mb-2" />
              <h5 className="fw-bold text-info mb-1">{getOrdersByStatus('in_progress').length}</h5>
              <small className="text-muted">En Progreso</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-6 col-md-3">
          <div className="card bg-success bg-opacity-10 border-0" style={{minHeight: '110px'}}>
            <div className="card-body text-center p-2 p-sm-3 d-flex flex-column justify-content-center">
              <CheckCircle size={28} className="text-success mb-2" />
              <h5 className="fw-bold text-success mb-1">{getOrdersByStatus('completed').length}</h5>
              <small className="text-muted">Completadas</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-6 col-md-3">
          <div className="card bg-secondary bg-opacity-10 border-0" style={{minHeight: '110px'}}>
            <div className="card-body text-center p-2 p-sm-3 d-flex flex-column justify-content-center">
              <Package size={28} className="text-secondary mb-2" />
              <h5 className="fw-bold text-secondary mb-1">{getOrdersByStatus('delivered').length}</h5>
              <small className="text-muted">Entregadas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Status sections */}
      <div className="row">
        <StatusSection 
          title="Pendientes" 
          status="pending" 
          icon={Clock} 
          color="warning"
        />
        <StatusSection 
          title="En Progreso" 
          status="in_progress" 
          icon={User} 
          color="info"
        />
        <StatusSection 
          title="Completadas" 
          status="completed" 
          icon={CheckCircle} 
          color="success"
        />
        <StatusSection 
          title="Entregadas" 
          status="delivered" 
          icon={Package} 
          color="secondary"
        />
      </div>
      
      {/* Auto-refresh indicator */}
      <div className="row mt-3">
        <div className="col-12 text-center">
          <AutoRefreshIndicator 
            realtime={true}
          />
        </div>
      </div>

      {/* Custom Modal */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        showCancel={modal.showCancel}
        confirmText={modal.confirmText}
        showTextInput={currentAction === 'complete' || currentAction === 'deliver'}
        textInputValue={currentAction === 'complete' ? completionNotes : deliveryNotes}
        onTextInputChange={currentAction === 'complete' ? setCompletionNotes : setDeliveryNotes}
        textInputPlaceholder={
          currentAction === 'complete' 
            ? 'Describe el trabajo realizado...' 
            : 'Notas adicionales de entrega (opcional)...'
        }
        textInputRequired={currentAction === 'complete'}
      />

      {/* ComandaPreview Modal */}
      {showComandaFor && (
        <ComandaPreview
          order={showComandaFor.order}
          customer={showComandaFor.customer}
          onClose={() => setShowComandaFor(null)}
        />
      )}
    </div>
  )
}

export default ServiceQueue
