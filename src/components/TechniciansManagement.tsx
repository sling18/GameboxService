import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useServiceOrders } from '../hooks/useServiceOrders'
import { supabase } from '../lib/supabase'
import { 
  Wrench, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Award,
  Target,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import type { User as UserType } from '../types'
import type { ServiceOrder } from '../types'

interface TechnicianStats {
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

type TimeFilter = 'week' | 'month' | 'year' | 'all'

const TechniciansManagement: React.FC = () => {
  const { user } = useAuth()
  const { serviceOrders, loading: ordersLoading } = useServiceOrders()
  const [technicians, setTechnicians] = useState<UserType[]>([])
  const [techStats, setTechStats] = useState<TechnicianStats[]>([])
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>('month')
  const [expandedTechnician, setExpandedTechnician] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar técnicos
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'technician')
          .order('full_name')

        if (error) throw error
        setTechnicians(data || [])
      } catch (err) {
        console.error('Error cargando técnicos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicians()
  }, [])

  // Calcular estadísticas de técnicos
  useEffect(() => {
    if (!technicians.length || !serviceOrders.length) return

    const stats: TechnicianStats[] = technicians.map(tech => {
      const completedOrders = serviceOrders.filter(order => 
        order.completed_by_id === tech.id && order.status === 'completed'
      )
      
      const inProgressOrders = serviceOrders.filter(order =>
        order.assigned_technician_id === tech.id && order.status === 'in_progress'
      )

      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

      const thisWeek = completedOrders.filter(order => 
        new Date(order.updated_at) >= oneWeekAgo
      ).length

      const thisMonth = completedOrders.filter(order => 
        new Date(order.updated_at) >= oneMonthAgo
      ).length

      const thisYear = completedOrders.filter(order => 
        new Date(order.updated_at) >= oneYearAgo
      ).length

      // Calcular tiempo promedio de finalización (estimado)
      const avgCompletionTime = completedOrders.length > 0 
        ? completedOrders.reduce((sum, order) => {
            const created = new Date(order.created_at)
            const completed = new Date(order.updated_at)
            return sum + (completed.getTime() - created.getTime())
          }, 0) / completedOrders.length / (1000 * 60 * 60 * 24) // días
        : 0

      return {
        id: tech.id,
        full_name: tech.full_name || tech.email?.split('@')[0] || 'Técnico',
        email: tech.email,
        totalCompleted: completedOrders.length,
        thisWeek,
        thisMonth,
        thisYear,
        completedOrders,
        inProgressOrders,
        avgCompletionTime,
        totalRevenue: completedOrders.length * 15000 // Estimado $15,000 por reparación
      }
    })

    // Ordenar por reparaciones completadas (descendente)
    stats.sort((a, b) => b.totalCompleted - a.totalCompleted)
    setTechStats(stats)
  }, [technicians, serviceOrders])

  const getTimeFilterValue = (stats: TechnicianStats): number => {
    switch (selectedTimeFilter) {
      case 'week': return stats.thisWeek
      case 'month': return stats.thisMonth  
      case 'year': return stats.thisYear
      case 'all': return stats.totalCompleted
      default: return stats.thisMonth
    }
  }

  const getFilterLabel = (): string => {
    switch (selectedTimeFilter) {
      case 'week': return 'Esta Semana'
      case 'month': return 'Este Mes'
      case 'year': return 'Este Año'
      case 'all': return 'Total'
      default: return 'Este Mes'
    }
  }

  const toggleExpand = (techId: string) => {
    setExpandedTechnician(expandedTechnician === techId ? null : techId)
  }

  if (loading || ordersLoading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-3">
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando técnicos...</span>
          </div>
          <p className="text-muted">Cargando estadísticas de técnicos...</p>
        </div>
      </div>
    )
  }

  if (user?.role !== 'admin') {
    return (
      <div className="container-fluid px-3 px-md-4 py-3">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <Users size={60} className="text-warning mb-3" />
                <h3 className="h5 fw-bold text-dark mb-3">Acceso Restringido</h3>
                <p className="text-muted">Solo los administradores pueden ver las estadísticas de técnicos.</p>
              </div>
            </div>
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
          <div className="card border-0 shadow-sm" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <div className="card-body text-white p-3 p-md-4">
              <div className="row align-items-center">
                <div className="col-md-9">
                  <h1 className="h4 fw-bold mb-2">
                    <Wrench className="me-2" size={24} />
                    Gestión de Técnicos
                  </h1>
                  <p className="mb-0 opacity-90">Estadísticas y rendimiento por técnico</p>
                  <small className="opacity-75">Control de productividad y reparaciones completadas</small>
                </div>
                <div className="col-md-3 text-end d-none d-md-block">
                  <BarChart3 size={60} className="opacity-25" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de Tiempo */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                  <h6 className="mb-0 fw-semibold">Estadísticas de Rendimiento</h6>
                  <small className="text-muted">Filtra por período de tiempo</small>
                </div>
                
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${selectedTimeFilter === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedTimeFilter('week')}
                  >
                    <Calendar size={14} className="me-1" />
                    Semana
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${selectedTimeFilter === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedTimeFilter('month')}
                  >
                    <Calendar size={14} className="me-1" />
                    Mes
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${selectedTimeFilter === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedTimeFilter('year')}
                  >
                    <Calendar size={14} className="me-1" />
                    Año
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${selectedTimeFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedTimeFilter('all')}
                  >
                    <Target size={14} className="me-1" />
                    Total
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-primary mb-2">
                <Users size={30} />
              </div>
              <h3 className="fw-bold mb-1">{technicians.length}</h3>
              <small className="text-muted">Técnicos Activos</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-success mb-2">
                <CheckCircle size={30} />
              </div>
              <h3 className="fw-bold mb-1">
                {techStats.reduce((sum, tech) => sum + getTimeFilterValue(tech), 0)}
              </h3>
              <small className="text-muted">Reparaciones - {getFilterLabel()}</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-warning mb-2">
                <Clock size={30} />
              </div>
              <h3 className="fw-bold mb-1">
                {techStats.reduce((sum, tech) => sum + tech.inProgressOrders.length, 0)}
              </h3>
              <small className="text-muted">En Progreso</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-info mb-2">
                <TrendingUp size={30} />
              </div>
              <h3 className="fw-bold mb-1">
                {techStats.length > 0 
                  ? Math.round(techStats.reduce((sum, tech) => sum + tech.avgCompletionTime, 0) / techStats.length) 
                  : 0}
              </h3>
              <small className="text-muted">Días Promedio</small>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Técnicos */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light border-0 d-flex align-items-center justify-content-between">
              <div>
                <h6 className="mb-0 fw-semibold">
                  <Award className="me-2" size={18} />
                  Rendimiento por Técnico - {getFilterLabel()}
                </h6>
              </div>
            </div>
            <div className="card-body p-0">
              {techStats.length === 0 ? (
                <div className="text-center py-5">
                  <Users size={60} className="text-muted mb-3" />
                  <h6 className="text-muted">No hay técnicos registrados</h6>
                  <p className="text-muted small">Los técnicos aparecerán aquí una vez que se registren en el sistema.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {techStats.map((tech, index) => {
                    const isExpanded = expandedTechnician === tech.id
                    const filterValue = getTimeFilterValue(tech)
                    
                    return (
                      <div key={tech.id} className="list-group-item border-0">
                        <div 
                          className="d-flex align-items-center justify-content-between cursor-pointer"
                          onClick={() => toggleExpand(tech.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <div className={`badge ${index < 3 ? 'bg-warning' : 'bg-secondary'} rounded-circle`} style={{width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                              </div>
                            </div>
                            
                            <div className="flex-grow-1">
                              <div className="fw-semibold">{tech.full_name}</div>
                              <small className="text-muted">{tech.email}</small>
                            </div>
                          </div>
                          
                          <div className="d-flex align-items-center gap-3">
                            <div className="text-center d-none d-md-block">
                              <div className="fw-bold text-success">{filterValue}</div>
                              <small className="text-muted">Completadas</small>
                            </div>
                            
                            <div className="text-center d-none d-md-block">
                              <div className="fw-bold text-primary">{tech.inProgressOrders.length}</div>
                              <small className="text-muted">En progreso</small>
                            </div>
                            
                            <div className="text-center d-none d-lg-block">
                              <div className="fw-bold text-info">{Math.round(tech.avgCompletionTime)} días</div>
                              <small className="text-muted">Promedio</small>
                            </div>
                            
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>

                        {/* Detalles Expandidos */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-top">
                            <div className="row g-3">
                              <div className="col-md-6">
                                <h6 className="fw-semibold mb-3">
                                  <CheckCircle size={16} className="me-1 text-success" />
                                  Reparaciones Completadas ({tech.completedOrders.length})
                                </h6>
                                
                                {tech.completedOrders.length === 0 ? (
                                  <p className="text-muted small">No hay reparaciones completadas aún.</p>
                                ) : (
                                  <div className="list-group list-group-flush">
                                    {tech.completedOrders.slice(0, 5).map(order => (
                                      <div key={order.id} className="list-group-item px-0 py-2 border-0 border-bottom">
                                        <div className="d-flex justify-content-between align-items-start">
                                          <div className="flex-grow-1">
                                            <div className="fw-medium small">{order.device_brand} {order.device_model}</div>
                                            <div className="text-muted small">{order.customer?.full_name}</div>
                                            <div className="text-primary small">#{order.order_number}</div>
                                          </div>
                                          <div className="text-end">
                                            <small className="text-muted">
                                              {new Date(order.updated_at).toLocaleDateString('es-ES')}
                                            </small>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {tech.completedOrders.length > 5 && (
                                      <div className="text-center pt-2">
                                        <small className="text-muted">
                                          ... y {tech.completedOrders.length - 5} más
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div className="col-md-6">
                                <h6 className="fw-semibold mb-3">
                                  <Clock size={16} className="me-1 text-warning" />
                                  En Progreso ({tech.inProgressOrders.length})
                                </h6>
                                
                                {tech.inProgressOrders.length === 0 ? (
                                  <p className="text-muted small">No hay reparaciones en progreso.</p>
                                ) : (
                                  <div className="list-group list-group-flush">
                                    {tech.inProgressOrders.map(order => (
                                      <div key={order.id} className="list-group-item px-0 py-2 border-0 border-bottom">
                                        <div className="d-flex justify-content-between align-items-start">
                                          <div className="flex-grow-1">
                                            <div className="fw-medium small">{order.device_brand} {order.device_model}</div>
                                            <div className="text-muted small">{order.customer?.full_name}</div>
                                            <div className="text-primary small">#{order.order_number}</div>
                                          </div>
                                          <div className="text-end">
                                            <small className="text-warning">
                                              {Math.round((new Date().getTime() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24))} días
                                            </small>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Estadísticas Resumidas */}
                            <div className="row g-2 mt-3 pt-3 border-top">
                              <div className="col-6 col-md-3">
                                <div className="text-center p-2 bg-light rounded">
                                  <div className="fw-bold text-success">{tech.thisWeek}</div>
                                  <small className="text-muted">Esta Semana</small>
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="text-center p-2 bg-light rounded">
                                  <div className="fw-bold text-primary">{tech.thisMonth}</div>
                                  <small className="text-muted">Este Mes</small>
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="text-center p-2 bg-light rounded">
                                  <div className="fw-bold text-info">{tech.thisYear}</div>
                                  <small className="text-muted">Este Año</small>
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="text-center p-2 bg-light rounded">
                                  <div className="fw-bold text-dark">{tech.totalCompleted}</div>
                                  <small className="text-muted">Total</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechniciansManagement