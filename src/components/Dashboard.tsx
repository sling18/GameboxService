import React from 'react'
import { useAuth } from '../contexts/AuthContextDemo'
import { useServiceOrdersDemo } from '../hooks/useServiceOrdersDemo'
import { useRouter } from '../contexts/RouterContext'
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  Wrench,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  Eye,
  AlertTriangle,
  Package,
  ArrowRight,
  Activity,
  Star
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { serviceOrders, loading } = useServiceOrdersDemo()
  const { navigate } = useRouter()

  const getStats = () => {
    const pending = serviceOrders.filter(order => order.status === 'pending').length
    const inProgress = serviceOrders.filter(order => order.status === 'in_progress').length
    const completed = serviceOrders.filter(order => order.status === 'completed').length
    const delivered = serviceOrders.filter(order => order.status === 'delivered').length
    const total = serviceOrders.length
    
    // Estadísticas adicionales
    const highPriority = serviceOrders.filter(order => order.priority === 'high' && order.status !== 'delivered').length
    const myOrders = user?.role === 'technician' ? serviceOrders.filter(order => order.assigned_technician_id === user.id).length : 0
    const todayOrders = serviceOrders.filter(order => {
      const today = new Date().toDateString()
      return new Date(order.created_at).toDateString() === today
    }).length

    return { pending, inProgress, completed, delivered, total, highPriority, myOrders, todayOrders }
  }

  const stats = getStats()

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
    const roleNames = {
      admin: 'Administrador',
      receptionist: 'Recepcionista', 
      technician: 'Técnico'
    }
    return `${greeting}, ${user?.full_name || roleNames[user?.role as keyof typeof roleNames] || 'Usuario'}`
  }

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <div className="container-fluid px-3 px-md-4">
            {/* Header Hero */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                  <div className="card-body text-white p-4 p-md-5">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h1 className="display-5 fw-bold mb-2">{getWelcomeMessage()}</h1>
                        <p className="lead mb-0 opacity-90">Panel de Administración - GameBox Service</p>
                        <small className="opacity-75">Control total del sistema de reparaciones</small>
                      </div>
                      <div className="col-md-4 text-end d-none d-md-block">
                        <TrendingUp size={80} className="opacity-25" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas principales */}
            <div className="row g-3 g-md-4 mb-4">
              <div className="col-6 col-lg-3">
                <StatCard
                  title="Total Órdenes"
                  value={stats.total}
                  icon={ClipboardList}
                  color="primary"
                  subtitle="Todas las órdenes"
                  trend="+12%"
                  onClick={() => navigate('orders')}
                />
              </div>
              <div className="col-6 col-lg-3">
                <StatCard
                  title="Pendientes"
                  value={stats.pending}
                  icon={Clock}
                  color="warning"
                  subtitle="Esperando técnico"
                  onClick={() => navigate('orders')}
                />
              </div>
              <div className="col-6 col-lg-3">
                <StatCard
                  title="En Progreso"
                  value={stats.inProgress}
                  icon={Wrench}
                  color="info"
                  subtitle="Siendo reparadas"
                  onClick={() => navigate('orders')}
                />
              </div>
              <div className="col-6 col-lg-3">
                <StatCard
                  title="Completadas"
                  value={stats.completed}
                  icon={CheckCircle}
                  color="success"
                  subtitle="Listas para entrega"
                  onClick={() => navigate('orders')}
                />
              </div>
            </div>

            {/* Estadísticas secundarias */}
            <div className="row g-3 g-md-4 mb-4">
              <div className="col-md-4">
                <StatCard
                  title="Órdenes Hoy"
                  value={stats.todayOrders}
                  icon={Calendar}
                  color="dark"
                  subtitle="Creadas hoy"
                  size="sm"
                />
              </div>
              <div className="col-md-4">
                <StatCard
                  title="Alta Prioridad"
                  value={stats.highPriority}
                  icon={AlertTriangle}
                  color="danger"
                  subtitle="Requieren atención"
                  size="sm"
                />
              </div>
              <div className="col-md-4">
                <StatCard
                  title="Entregadas"
                  value={stats.delivered}
                  icon={Package}
                  color="secondary"
                  subtitle="Proceso completo"
                  size="sm"
                />
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-transparent border-0 pt-3">
                    <h5 className="card-title mb-0">
                      <Activity className="me-2" size={20} />
                      Acciones Rápidas
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-6 col-lg-3">
                        <button onClick={() => navigate('create-order')} className="btn btn-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 border-0">
                          <Plus size={24} className="mb-2" />
                          <span className="fw-semibold">Nueva Orden</span>
                          <small className="opacity-75">Registrar dispositivo</small>
                        </button>
                      </div>
                      <div className="col-6 col-lg-3">
                        <button onClick={() => navigate('customers')} className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3">
                          <Users size={24} className="mb-2" />
                          <span className="fw-semibold">Buscar Cliente</span>
                          <small className="opacity-75">Por cédula</small>
                        </button>
                      </div>
                      <div className="col-6 col-lg-3">
                        <button onClick={() => navigate('orders')} className="btn btn-outline-secondary w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3">
                          <Eye size={24} className="mb-2" />
                          <span className="fw-semibold">Ver Órdenes</span>
                          <small className="opacity-75">Todas las órdenes</small>
                        </button>
                      </div>
                      <div className="col-6 col-lg-3">
                        <button onClick={() => navigate('settings')} className="btn btn-outline-secondary w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3">
                          <Wrench size={24} className="mb-2" />
                          <span className="fw-semibold">Configuración</span>
                          <small className="opacity-75">Sistema</small>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'receptionist':
        return (
          <div className="container-fluid px-3 px-md-4">
            {/* Header Hero */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
                  <div className="card-body text-white p-4 p-md-5">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h1 className="display-5 fw-bold mb-2">{getWelcomeMessage()}</h1>
                        <p className="lead mb-0 opacity-90">Gestión de Recepción - GameBox Service</p>
                        <small className="opacity-75">Atención al cliente y gestión de órdenes</small>
                      </div>
                      <div className="col-md-4 text-end d-none d-md-block">
                        <Users size={80} className="opacity-25" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas para recepcionista */}
            <div className="row g-3 g-md-4 mb-4">
              <div className="col-md-4">
                <StatCard
                  title="Órdenes Hoy"
                  value={stats.todayOrders}
                  icon={Calendar}
                  color="primary"
                  subtitle="Creadas hoy"
                  onClick={() => navigate('orders')}
                />
              </div>
              <div className="col-md-4">
                <StatCard
                  title="Pendientes"
                  value={stats.pending}
                  icon={Clock}
                  color="warning"
                  subtitle="Esperando técnico"
                  onClick={() => navigate('orders')}
                />
              </div>
              <div className="col-md-4">
                <StatCard
                  title="Para Entrega"
                  value={stats.completed}
                  icon={CheckCircle}
                  color="success"
                  subtitle="Listas para cliente"
                  onClick={() => navigate('orders')}
                />
              </div>
            </div>

            {/* Acciones principales */}
            <div className="row g-4 mb-4">
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100 hover-card">
                  <div className="card-body text-center p-4 p-md-5">
                    <div className="mb-4">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3">
                        <Plus size={40} className="text-primary" />
                      </div>
                    </div>
                    <h4 className="card-title fw-bold mb-3">Nueva Orden de Servicio</h4>
                    <p className="card-text text-muted mb-4">
                      Registra un nuevo equipo para reparación y crea la orden de servicio
                    </p>
                    <button onClick={() => navigate('create-order')} className="btn btn-primary btn-lg px-4">
                      Crear Orden
                      <ArrowRight size={20} className="ms-2" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100 hover-card">
                  <div className="card-body text-center p-4 p-md-5">
                    <div className="mb-4">
                      <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3">
                        <Users size={40} className="text-success" />
                      </div>
                    </div>
                    <h4 className="card-title fw-bold mb-3">Buscar Cliente</h4>
                    <p className="card-text text-muted mb-4">
                      Encuentra cliente por cédula y consulta su historial de reparaciones
                    </p>
                    <button onClick={() => navigate('customers')} className="btn btn-outline-success btn-lg px-4">
                      Buscar Cliente
                      <ArrowRight size={20} className="ms-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerta de prioridades */}
            {stats.highPriority > 0 && (
              <div className="row mb-4">
                <div className="col-12">
                  <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center">
                    <AlertTriangle size={24} className="me-3 text-warning" />
                    <div className="flex-grow-1">
                      <h6 className="alert-heading mb-1">Atención Requerida</h6>
                      <p className="mb-0">
                        Hay {stats.highPriority} orden{stats.highPriority !== 1 ? 'es' : ''} de alta prioridad pendiente{stats.highPriority !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button onClick={() => navigate('orders')} className="btn btn-warning btn-sm">
                      Ver Órdenes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
        
      case 'technician':
        const myOrders = serviceOrders.filter(order => order.assigned_technician_id === user.id)
        const availableOrders = serviceOrders.filter(order => order.status === 'pending')
        const myCompleted = myOrders.filter(order => order.status === 'completed')
        
        return (
          <div className="container-fluid px-3 px-md-4">
            {/* Header Hero */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                  <div className="card-body text-white p-4 p-md-5">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h1 className="display-5 fw-bold mb-2">{getWelcomeMessage()}</h1>
                        <p className="lead mb-0 opacity-90">Cola de Reparaciones - GameBox Service</p>
                        <small className="opacity-75">Gestión técnica y reparaciones</small>
                      </div>
                      <div className="col-md-4 text-end d-none d-md-block">
                        <Wrench size={80} className="opacity-25" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas para técnico */}
            <div className="row g-3 g-md-4 mb-4">
              <div className="col-md-4">
                <StatCard
                  title="Mis Reparaciones"
                  value={myOrders.filter(o => o.status === 'in_progress').length}
                  icon={Wrench}
                  color="primary"
                  subtitle="En progreso"
                  onClick={() => navigate('orders')}
                />
              </div>
              <div className="col-md-4">
                <StatCard
                  title="Disponibles"
                  value={availableOrders.length}
                  icon={Clock}
                  color="warning"
                  subtitle="Para tomar"
                  onClick={() => navigate('orders')}
                />
              </div>
              <div className="col-md-4">
                <StatCard
                  title="Completadas Hoy"
                  value={myCompleted.filter(order => {
                    const today = new Date().toDateString()
                    return new Date(order.updated_at).toDateString() === today
                  }).length}
                  icon={CheckCircle}
                  color="success"
                  subtitle="Finalizadas hoy"
                  onClick={() => navigate('orders')}
                />
              </div>
            </div>

            {/* Acción principal */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm hover-card">
                  <div className="card-body text-center p-4 p-md-5">
                    <div className="mb-4">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-4">
                        <Wrench size={48} className="text-primary" />
                      </div>
                    </div>
                    <h3 className="card-title fw-bold mb-3">Cola de Reparaciones</h3>
                    <p className="card-text text-muted mb-4 fs-5">
                      {availableOrders.length > 0 ? 
                        `Hay ${availableOrders.length} reparación${availableOrders.length !== 1 ? 'es' : ''} disponible${availableOrders.length !== 1 ? 's' : ''} para tomar` :
                        'No hay reparaciones disponibles en este momento'
                      }
                    </p>
                    <button onClick={() => navigate('orders')} className="btn btn-primary btn-lg px-5">
                      Ver Cola de Reparaciones
                      <ArrowRight size={20} className="ms-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Progreso personal */}
            {myOrders.length > 0 && (
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0 pt-3">
                      <h5 className="card-title mb-0">
                        <Star className="me-2" size={20} />
                        Mi Progreso
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                            <span className="text-muted">Reparaciones asignadas:</span>
                            <span className="fw-bold fs-5">{myOrders.length}</span>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                            <span className="text-muted">En progreso:</span>
                            <span className="fw-bold fs-5 text-primary">{myOrders.filter(o => o.status === 'in_progress').length}</span>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                            <span className="text-muted">Completadas:</span>
                            <span className="fw-bold fs-5 text-success">{myCompleted.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
        
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4">
        <div className="row justify-content-center align-items-center" style={{minHeight: '60vh'}}>
          <div className="col-auto text-center">
            <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted fs-5">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100">
      {getRoleSpecificContent()}
      
      {/* Tabla de órdenes recientes */}
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-11">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0 pt-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0 d-flex align-items-center">
                    <ClipboardList size={20} className="me-2 text-primary" />
                    Órdenes Recientes
                  </h5>
                  <button 
                    onClick={() => navigate('orders')} 
                    className="btn btn-outline-primary btn-sm d-flex align-items-center"
                  >
                    Ver Todas
                    <ArrowRight size={16} className="ms-1" />
                  </button>
                </div>
              </div>
              <div className="card-body">
                {serviceOrders.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="card-icon bg-light mb-3">
                      <ClipboardList size={48} className="text-muted" />
                    </div>
                    <h6 className="text-muted mb-3">No hay órdenes de servicio registradas</h6>
                    {(user?.role === 'admin' || user?.role === 'receptionist') && (
                      <button 
                        onClick={() => navigate('create-order')} 
                        className="btn btn-primary"
                      >
                        <Plus size={16} className="me-2" />
                        Crear Primera Orden
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" className="border-0 fw-semibold">Cliente</th>
                          <th scope="col" className="border-0 fw-semibold">Dispositivo</th>
                          <th scope="col" className="border-0 fw-semibold">Estado</th>
                          <th scope="col" className="border-0 fw-semibold">Prioridad</th>
                          <th scope="col" className="border-0 fw-semibold">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceOrders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="border-0">
                            <td>
                              <div>
                                <div className="fw-semibold">{order.customer?.full_name}</div>
                                <small className="text-muted">{order.customer?.cedula}</small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{order.device_brand} {order.device_model}</div>
                                <small className="text-muted">{order.device_type}</small>
                              </div>
                            </td>
                            <td>
                              <StatusBadge status={order.status} />
                            </td>
                            <td>
                              <PriorityBadge priority={order.priority} />
                            </td>
                            <td>
                              <small className="text-muted">
                                {new Date(order.created_at).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: any
  color: 'primary' | 'warning' | 'info' | 'success' | 'danger' | 'secondary' | 'dark'
  subtitle?: string
  trend?: string
  onClick?: () => void
  size?: 'sm' | 'md'
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle,
  trend,
  onClick,
  size = 'md'
}) => {
  const colorClasses = {
    primary: 'bg-primary',
    warning: 'bg-warning', 
    info: 'bg-info',
    success: 'bg-success',
    danger: 'bg-danger',
    secondary: 'bg-secondary',
    dark: 'bg-dark'
  }

  const hoverClasses = onClick ? 'hover-card' : ''
  const cardHeight = size === 'sm' ? 'h-auto' : 'h-100'

  return (
    <div 
      className={`card border-0 shadow-sm ${hoverClasses} ${cardHeight}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center">
          <div className={`${colorClasses[color]} bg-opacity-10 rounded-3 p-2 p-md-3 me-3 d-flex align-items-center justify-content-center`}>
            <Icon size={size === 'sm' ? 20 : 24} className={`text-${color}`} />
          </div>
          <div className="flex-grow-1">
            <h6 className="card-subtitle mb-1 text-muted small">{title}</h6>
            {subtitle && (
              <p className="mb-1 text-muted" style={{fontSize: '0.75rem'}}>{subtitle}</p>
            )}
            <div className="d-flex align-items-center">
              <h4 className={`card-title mb-0 fw-bold ${size === 'sm' ? 'h5' : 'h3'}`}>{value}</h4>
              {trend && (
                <small className="text-success ms-2">{trend}</small>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'completed' | 'delivered'
}

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high'
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'Pendiente',
      classes: 'bg-warning text-dark'
    },
    in_progress: {
      label: 'En Progreso',
      classes: 'bg-primary text-white'
    },
    completed: {
      label: 'Completada',
      classes: 'bg-success text-white'
    },
    delivered: {
      label: 'Entregada',
      classes: 'bg-secondary text-white'
    }
  }

  const config = statusConfig[status]

  return (
    <span className={`badge ${config.classes} rounded-pill`}>
      {config.label}
    </span>
  )
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const priorityConfig = {
    low: {
      label: 'Baja',
      classes: 'bg-light text-dark'
    },
    medium: {
      label: 'Media', 
      classes: 'bg-warning text-dark'
    },
    high: {
      label: 'Alta',
      classes: 'bg-danger text-white'
    }
  }

  const config = priorityConfig[priority]

  return (
    <span className={`badge ${config.classes} rounded-pill`}>
      {config.label}
    </span>
  )
}

export default Dashboard
