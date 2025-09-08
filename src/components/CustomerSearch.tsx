import React, { useState } from 'react'
import { useCustomersDemo } from '../hooks/useCustomersDemo'
import { useServiceOrdersDemo } from '../hooks/useServiceOrdersDemo'
import { Search, User, Clock, CheckCircle, Package, Phone, Mail, Calendar, UserPlus } from 'lucide-react'

const CustomerSearch: React.FC = () => {
  const [cedula, setCedula] = useState('')
  const [customer, setCustomer] = useState<any>(null)
  const [customerOrders, setCustomerOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  
  const { getCustomerByCedula } = useCustomersDemo()
  const { getServiceOrdersByCustomer } = useServiceOrdersDemo()

  const handleSearch = async () => {
    if (!cedula.trim()) return
    
    setLoading(true)
    setNotFound(false)
    
    try {
      const foundCustomer = await getCustomerByCedula(cedula.trim())
      
      if (foundCustomer) {
        setCustomer(foundCustomer)
        const orders = await getServiceOrdersByCustomer(foundCustomer.id)
        setCustomerOrders(orders)
      } else {
        setCustomer(null)
        setCustomerOrders([])
        setNotFound(true)
      }
    } catch (error) {
      console.error('Error searching customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'warning', icon: Clock, label: 'Pendiente' },
      in_progress: { color: 'info', icon: User, label: 'En Progreso' },
      completed: { color: 'success', icon: CheckCircle, label: 'Completada' },
      delivered: { color: 'secondary', icon: Package, label: 'Entregada' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`badge bg-${config.color} d-flex align-items-center`}>
        <Icon size={12} className="me-1" />
        {config.label}
      </span>
    )
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-3">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
            <div className="card-body text-white p-3 p-md-4">
              <div className="row align-items-center">
                <div className="col-md-9">
                  <h1 className="h4 fw-bold mb-2">Búsqueda de Clientes</h1>
                  <p className="mb-0 opacity-90">Encuentra clientes por cédula y consulta su historial</p>
                  <small className="opacity-75">Gestión completa de información de clientes</small>
                </div>
                <div className="col-md-3 text-end d-none d-md-block">
                  <Search size={60} className="opacity-25" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Formulario de búsqueda */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 py-3">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <Search size={18} className="me-2 text-primary" />
                Buscar Cliente por Cédula
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-8">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <User size={16} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Ingresa el número de cédula"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search size={16} className="me-2" />
                        Buscar Cliente
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cliente no encontrado */}
      {notFound && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3">
                    <User size={48} className="text-warning" />
                  </div>
                </div>
                <h5 className="fw-bold mb-3">Cliente no encontrado</h5>
                <p className="text-muted mb-4">
                  No se encontró ningún cliente con la cédula: <strong>{cedula}</strong>
                </p>
                <button className="btn btn-outline-primary">
                  <UserPlus size={16} className="me-2" />
                  Registrar Nuevo Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {customer && (
        <>
          {/* Información del cliente */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0 py-3">
                  <h5 className="card-title mb-0 d-flex align-items-center">
                    <User size={18} className="me-2 text-success" />
                    Información del Cliente
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center p-3 bg-light rounded">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                          <User size={20} className="text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-1 fw-semibold">Nombre Completo</h6>
                          <p className="mb-0 text-muted">{customer.full_name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center p-3 bg-light rounded">
                        <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                          <User size={20} className="text-info" />
                        </div>
                        <div>
                          <h6 className="mb-1 fw-semibold">Cédula</h6>
                          <p className="mb-0 text-muted">{customer.cedula}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center p-3 bg-light rounded">
                        <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                          <Phone size={20} className="text-success" />
                        </div>
                        <div>
                          <h6 className="mb-1 fw-semibold">Teléfono</h6>
                          <p className="mb-0 text-muted">{customer.phone || 'No registrado'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center p-3 bg-light rounded">
                        <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                          <Mail size={20} className="text-warning" />
                        </div>
                        <div>
                          <h6 className="mb-1 fw-semibold">Email</h6>
                          <p className="mb-0 text-muted">{customer.email || 'No registrado'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de órdenes */}
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0 d-flex align-items-center">
                      <Calendar size={18} className="me-2 text-primary" />
                      Historial de Órdenes de Servicio
                    </h5>
                    <span className="badge bg-primary">{customerOrders.length} órdenes</span>
                  </div>
                </div>
                <div className="card-body">
                  {customerOrders.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <div className="bg-light rounded-circle d-inline-flex p-3">
                          <Clock size={48} className="text-muted" />
                        </div>
                      </div>
                      <h6 className="text-muted mb-3">Sin historial de órdenes</h6>
                      <p className="text-muted">Este cliente no tiene órdenes de servicio registradas</p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {customerOrders.map(order => (
                        <div key={order.id} className="col-12">
                          <div className="card bg-light border-0">
                            <div className="card-body p-3">
                              <div className="row align-items-start">
                                <div className="col-md-8">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                      <h6 className="fw-bold mb-1">
                                        {order.device_brand} {order.device_model}
                                      </h6>
                                      <small className="text-muted">{order.device_type}</small>
                                    </div>
                                    {getStatusBadge(order.status)}
                                  </div>
                                  
                                  <div className="mb-2">
                                    <strong className="small text-muted">Problema Reportado:</strong>
                                    <p className="small mb-0">{order.problem_description}</p>
                                  </div>
                                  
                                  {order.completion_notes && (
                                    <div className="mb-2">
                                      <strong className="small text-success">Trabajo Realizado:</strong>
                                      <p className="small mb-0">{order.completion_notes}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="col-md-4">
                                  <div className="text-end">
                                    <small className="text-muted d-block">
                                      <Calendar size={12} className="me-1" />
                                      {new Date(order.created_at).toLocaleDateString('es-ES')}
                                    </small>
                                    {order.assigned_technician && (
                                      <small className="text-muted d-block">
                                        <User size={12} className="me-1" />
                                        {order.assigned_technician.full_name}
                                      </small>
                                    )}
                                    
                                    {order.status === 'completed' && (
                                      <button className="btn btn-success btn-sm mt-2">
                                        <Package size={12} className="me-1" />
                                        Marcar Entregada
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CustomerSearch
