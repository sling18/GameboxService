import React from 'react'
import { useServiceOrders } from '../hooks/useServiceOrders'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from '../contexts/RouterContext'
import { Clock, User, CheckCircle, Package, Plus, Wrench, AlertTriangle, Calendar } from 'lucide-react'
import AutoRefreshIndicator from './AutoRefreshIndicator'

const ServiceQueue: React.FC = () => {
  const { serviceOrders, loading, updateServiceOrder, lastRefresh } = useServiceOrders(true) // Enable auto-refresh
  const { user } = useAuth()
  const { navigate } = useRouter()

  const handleTakeOrder = async (orderId: string) => {
    if (!user) return
    await updateServiceOrder(orderId, { 
      assigned_technician_id: user.id,
      status: 'in_progress' 
    })
  }

  const handleCompleteOrder = async (orderId: string) => {
    const notes = prompt('Ingresa las notas de completado:')
    if (notes) {
      await updateServiceOrder(orderId, { 
        status: 'completed',
        completion_notes: notes 
      })
    }
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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { color: 'danger', label: 'Alta' },
      medium: { color: 'warning', label: 'Media' },
      low: { color: 'success', label: 'Baja' }
    }
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low
    return <span className={`badge bg-${config.color}`}>{config.label}</span>
  }

  const StatusSection: React.FC<{ title: string; status: string; icon: any; color: string }> = ({ 
    title, 
    status, 
    icon: Icon, 
    color 
  }) => {
    const orders = getOrdersByStatus(status)
    
    return (
      <div className="col-12 col-lg-6 col-xl-3 mb-4">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header bg-transparent border-0 py-3">
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
          
          <div className="card-body p-0" style={{maxHeight: '500px', overflowY: 'auto'}}>
            {orders.length === 0 ? (
              <div className="text-center py-4">
                <div className={`bg-${color} bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3`}>
                  <Icon size={32} className={`text-${color}`} />
                </div>
                <h6 className="text-muted">Sin órdenes {title.toLowerCase()}</h6>
              </div>
            ) : (
              <div className="p-2">
                {orders.map(order => (
                  <div key={order.id} className="card bg-light border-0 mb-2">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1 text-truncate">
                            {order.device_brand} {order.device_model}
                          </h6>
                          <small className="text-muted d-block">
                            {order.customer?.full_name}
                          </small>
                          <small className="text-primary d-block fw-semibold">
                            #{order.order_number}
                          </small>
                        </div>
                        {getPriorityBadge(order.priority)}
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
                            >
                              <Wrench size={12} className="me-1" />
                              Tomar Reparación
                            </button>
                          )}
                          {status === 'in_progress' && (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleCompleteOrder(order.id)}
                            >
                              <CheckCircle size={12} className="me-1" />
                              Completar
                            </button>
                          )}
                        </div>
                      )}
                      
                      {order.assigned_technician && status !== 'pending' && (
                        <div className="mt-2 pt-2 border-top">
                          <small className="text-muted">
                            <User size={12} className="me-1" />
                            {order.assigned_technician.full_name}
                          </small>
                        </div>
                      )}
                      
                      {order.completion_notes && (
                        <div className="mt-2 pt-2 border-top">
                          <small className="text-success">
                            <strong>Notas:</strong> {order.completion_notes}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-warning bg-opacity-10 border-0">
            <div className="card-body text-center p-3">
              <Clock size={32} className="text-warning mb-2" />
              <h5 className="fw-bold text-warning">{getOrdersByStatus('pending').length}</h5>
              <small className="text-muted">Pendientes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info bg-opacity-10 border-0">
            <div className="card-body text-center p-3">
              <User size={32} className="text-info mb-2" />
              <h5 className="fw-bold text-info">{getOrdersByStatus('in_progress').length}</h5>
              <small className="text-muted">En Progreso</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success bg-opacity-10 border-0">
            <div className="card-body text-center p-3">
              <CheckCircle size={32} className="text-success mb-2" />
              <h5 className="fw-bold text-success">{getOrdersByStatus('completed').length}</h5>
              <small className="text-muted">Completadas</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-secondary bg-opacity-10 border-0">
            <div className="card-body text-center p-3">
              <Package size={32} className="text-secondary mb-2" />
              <h5 className="fw-bold text-secondary">{getOrdersByStatus('delivered').length}</h5>
              <small className="text-muted">Entregadas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Priority alert */}
      {serviceOrders.filter(o => o.priority === 'high' && o.status !== 'delivered').length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center">
              <AlertTriangle size={20} className="me-2 text-warning" />
              <div className="flex-grow-1">
                <h6 className="alert-heading mb-1">¡Atención Prioritaria!</h6>
                <p className="mb-0 small">
                  Hay {serviceOrders.filter(o => o.priority === 'high' && o.status !== 'delivered').length} orden(es) de alta prioridad pendiente(s)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
            lastRefresh={lastRefresh} 
            interval={15}
            showInterval={true}
          />
        </div>
      </div>
    </div>
  )
}

export default ServiceQueue
