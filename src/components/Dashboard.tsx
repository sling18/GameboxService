import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useServiceOrders } from '../hooks/useServiceOrders'
import { useRouter } from '../contexts/RouterContext'
import UserManagement from './UserManagement'
import AutoRefreshIndicator from './AutoRefreshIndicator'
import DeliverySection from './DeliverySection'
import DatabaseMigration from './DatabaseMigration'
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
  const { serviceOrders, loading, lastRefresh } = useServiceOrders(true) // Enabled auto-refresh
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
          <div className="container-fluid px-3 px-md-4 py-3">
            {/* Header Hero */}
            <div className="row mb-3">
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                  <div className="card-body text-white p-3 p-md-4">
                    <div className="row align-items-center">
                      <div className="col-md-9">
                        <h2 className="h4 fw-bold mb-2">{getWelcomeMessage()}</h2>
                        <p className="mb-0 opacity-90">Panel de Administración - GameBox Service</p>
                        <small className="opacity-75">Control total del sistema de reparaciones</small>
                        <div className="mt-2">
                          <AutoRefreshIndicator 
                            lastRefresh={lastRefresh} 
                            interval={15}
                            size="sm"
                            className="opacity-75"
                          />
                        </div>
                      </div>
                      <div className="col-md-3 text-end d-none d-md-block">
                        <TrendingUp size={60} className="opacity-25" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas principales */}
            <div className="row g-2 g-md-3 mb-3">
              <div className="col-6 col-md-3">
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
              <div className="col-6 col-md-3">
                <StatCard
                  title="Pendientes"
                  value={stats.pending}
                  icon={Clock}
                  color="warning"
                  subtitle="Esperando técnico"
                  onClick={() => navigate('orders')}
                />
              </div>
              <div className="col-6 col-md-3">
                <StatCard
                  title="En Progreso"
                  value={stats.inProgress}
                  icon={Wrench}
                  color="info"
                  subtitle="Siendo reparadas"
                  onClick={() => navigate('orders')}
                />
              </div>
              <div className="col-6 col-md-3">
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
            <div className="row g-2 g-md-3 mb-3">
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
            <div className="row mb-3">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-transparent border-0 py-2">
                    <h6 className="card-title mb-0">
                      <Activity className="me-2" size={18} />
                      Acciones Rápidas
                    </h6>
                  </div>
                  <div className="card-body p-3">
                    <div className="row g-2">
                      <div className="col-6 col-lg-3">
                        <button onClick={() => navigate('create-order')} className="btn btn-primary w-100 d-flex flex-column align-items-center justify-content-center p-2 border-0">
                          <Plus size={20} className="mb-1" />
                          <span className="fw-semibold small">Nueva Orden</span>
                          <small className="opacity-75">Registrar dispositivo</small>
                        </button>
                      </div>
                      <div className="col-6 col-lg-3">
                        <button onClick={() => navigate('customers')} className="btn btn-outline-primary w-100 d-flex flex-column align-items-center justify-content-center p-2">
                          <Users size={20} className="mb-1" />
                          <span className="fw-semibold small">Buscar Cliente</span>
                          <small className="opacity-75">Por cédula</small>
                        </button>
                      </div>
                      <div className="col-6 col-lg-3">
                        <button onClick={() => navigate('orders')} className="btn btn-outline-secondary w-100 d-flex flex-column align-items-center justify-content-center p-2">
                          <Eye size={20} className="mb-1" />
                          <span className="fw-semibold small">Ver Órdenes</span>
                          <small className="opacity-75">Todas las órdenes</small>
                        </button>
                      </div>
                      <div className="col-6 col-lg-3">
                        <button onClick={() => navigate('settings')} className="btn btn-outline-secondary w-100 d-flex flex-column align-items-center justify-content-center p-2">
                          <Wrench size={20} className="mb-1" />
                          <span className="fw-semibold small">Configuración</span>
                          <small className="opacity-75">Sistema</small>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de entregas pendientes */}
            <DeliverySection />

            {/* Migración de base de datos */}
            <DatabaseMigration />

            {/* Gestión de Usuarios - Solo para Administradores */}
            <div className="row mb-3">
              <div className="col-12">
                <UserManagement />
              </div>
            </div>
          </div>
        )
        
      case 'receptionist':
        return (
          <div className="container-fluid px-3 px-md-4 py-3">
            {/* Header Hero */}
            <div className="row mb-3">
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
                  <div className="card-body text-white p-3 p-md-4">
                    <div className="row align-items-center">
                      <div className="col-md-9">
                        <h2 className="h4 fw-bold mb-2">{getWelcomeMessage()}</h2>
                        <p className="mb-0 opacity-90">Gestión de Recepción - GameBox Service</p>
                        <small className="opacity-75">Atención al cliente y gestión de órdenes</small>
                        <div className="mt-2">
                          <AutoRefreshIndicator 
                            lastRefresh={lastRefresh} 
                            interval={15}
                            size="sm"
                            className="opacity-75"
                          />
                        </div>
                      </div>
                      <div className="col-md-3 text-end d-none d-md-block">
                        <Users size={60} className="opacity-25" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas para recepcionista */}
            <div className="row g-2 g-md-3 mb-3">
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
            <div className="row g-3 mb-3">
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100 hover-card">
                  <div className="card-body text-center p-3 p-md-4">
                    <div className="mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-2">
                        <Plus size={32} className="text-primary" />
                      </div>
                    </div>
                    <h5 className="card-title fw-bold mb-2">Nueva Orden de Servicio</h5>
                    <p className="card-text text-muted mb-3 small">
                      Registra un nuevo equipo para reparación y crea la orden de servicio
                    </p>
                    <button onClick={() => navigate('create-order')} className="btn btn-primary px-3">
                      Crear Orden
                      <ArrowRight size={16} className="ms-2" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100 hover-card">
                  <div className="card-body text-center p-3 p-md-4">
                    <div className="mb-3">
                      <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-2">
                        <Users size={32} className="text-success" />
                      </div>
                    </div>
                    <h5 className="card-title fw-bold mb-2">Buscar Cliente</h5>
                    <p className="card-text text-muted mb-3 small">
                      Encuentra cliente por cédula y consulta su historial de reparaciones
                    </p>
                    <button onClick={() => navigate('customers')} className="btn btn-outline-success px-3">
                      Buscar Cliente
                      <ArrowRight size={16} className="ms-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerta de prioridades */}
            {stats.highPriority > 0 && (
              <div className="row mb-3">
                <div className="col-12">
                  <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center py-2">
                    <AlertTriangle size={20} className="me-2 text-warning" />
                    <div className="flex-grow-1">
                      <h6 className="alert-heading mb-1 small">Atención Requerida</h6>
                      <p className="mb-0 small">
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
            
            {/* Sección de entregas pendientes */}
            <DeliverySection />
          </div>
        )
        
      case 'technician':
        const myOrders = serviceOrders.filter(order => order.assigned_technician_id === user.id)
        const availableOrders = serviceOrders.filter(order => order.status === 'pending')
        const myCompleted = myOrders.filter(order => order.status === 'completed')
        
        return (
          <div className="container-fluid px-3 px-md-4 py-3">
            {/* Header Hero */}
            <div className="row mb-3">
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                  <div className="card-body text-white p-3 p-md-4">
                    <div className="row align-items-center">
                      <div className="col-md-9">
                        <h2 className="h4 fw-bold mb-2">{getWelcomeMessage()}</h2>
                        <p className="mb-0 opacity-90">Cola de Reparaciones - GameBox Service</p>
                        <small className="opacity-75">Gestión técnica y reparaciones</small>
                        <div className="mt-2">
                          <AutoRefreshIndicator 
                            lastRefresh={lastRefresh} 
                            interval={15}
                            size="sm"
                            className="opacity-75"
                          />
                        </div>
                      </div>
                      <div className="col-md-3 text-end d-none d-md-block">
                        <Wrench size={60} className="opacity-25" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas para técnico */}
            <div className="row g-2 g-md-3 mb-3">
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
            <div className="row mb-3">
              <div className="col-12">
                <div className="card border-0 shadow-sm hover-card">
                  <div className="card-body text-center p-3 p-md-4">
                    <div className="mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3">
                        <Wrench size={36} className="text-primary" />
                      </div>
                    </div>
                    <h4 className="card-title fw-bold mb-2">Cola de Reparaciones</h4>
                    <p className="card-text text-muted mb-3">
                      {availableOrders.length > 0 ? 
                        `Hay ${availableOrders.length} reparación${availableOrders.length !== 1 ? 'es' : ''} disponible${availableOrders.length !== 1 ? 's' : ''} para tomar` :
                        'No hay reparaciones disponibles en este momento'
                      }
                    </p>
                    <button onClick={() => navigate('orders')} className="btn btn-primary px-4">
                      Ver Cola de Reparaciones
                      <ArrowRight size={16} className="ms-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Progreso personal */}
            {myOrders.length > 0 && (
              <div className="row mb-3">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0 py-2">
                      <h6 className="card-title mb-0">
                        <Star className="me-2" size={18} />
                        Mi Progreso
                      </h6>
                    </div>
                    <div className="card-body p-3">
                      <div className="row g-2">
                        <div className="col-md-4">
                          <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                            <span className="text-muted small">Reparaciones asignadas:</span>
                            <span className="fw-bold">{myOrders.length}</span>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                            <span className="text-muted small">En progreso:</span>
                            <span className="fw-bold text-primary">{myOrders.filter(o => o.status === 'in_progress').length}</span>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                            <span className="text-muted small">Completadas:</span>
                            <span className="fw-bold text-success">{myCompleted.length}</span>
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
      <div className="container-fluid px-2 px-md-3">
        <div className="row justify-content-center align-items-center" style={{minHeight: '50vh'}}>
          <div className="col-auto text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100">
      {getRoleSpecificContent()}
      
      {/* Tabla de órdenes recientes */}
      <div className="container-fluid px-3 px-md-4 py-3">
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0 d-flex align-items-center">
                    <ClipboardList size={18} className="me-2 text-primary" />
                    Órdenes Recientes
                  </h5>
                  <button 
                    onClick={() => navigate('orders')} 
                    className="btn btn-outline-primary btn-sm d-flex align-items-center"
                  >
                    Ver Todas
                    <ArrowRight size={14} className="ms-1" />
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
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
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" className="border-0 fw-semibold px-3 py-3">Cliente</th>
                          <th scope="col" className="border-0 fw-semibold px-3 py-3">Dispositivo</th>
                          <th scope="col" className="border-0 fw-semibold px-3 py-3">Estado</th>
                          <th scope="col" className="border-0 fw-semibold px-3 py-3">Prioridad</th>
                          <th scope="col" className="border-0 fw-semibold px-3 py-3">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceOrders.slice(0, 8).map((order) => (
                          <tr key={order.id} className="border-0">
                            <td className="px-3 py-3">
                              <div>
                                <div className="fw-semibold">{order.customer?.full_name}</div>
                                <small className="text-muted">{order.customer?.cedula}</small>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div>
                                <div className="fw-medium">{order.device_brand} {order.device_model}</div>
                                <small className="text-muted">{order.device_type}</small>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="px-3 py-3">
                              <PriorityBadge priority={order.priority} />
                            </td>
                            <td className="px-3 py-3">
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
