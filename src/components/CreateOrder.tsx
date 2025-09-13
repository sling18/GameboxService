import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useCustomers } from '../hooks/useCustomers'
import { useServiceOrders } from '../hooks/useServiceOrders'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from '../contexts/RouterContext'
import { Search, Plus, Save, User, UserPlus, Package, ClipboardList } from 'lucide-react'
import { CustomModal } from './ui/CustomModal'
import ComandaPreview from './ComandaPreview'

interface ModalState {
  isOpen: boolean
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  title: string
  message: string
  onConfirm?: () => void
  showCancel?: boolean
  confirmText?: string
}

const CreateOrder: React.FC = () => {
  const { user } = useAuth()
  const { navigate } = useRouter()

  // Redirigir técnicos al dashboard si llegan aquí por error
  useEffect(() => {
    if (user?.role === 'technician') {
      console.log('⚠️ Técnico redirigido desde CreateOrder al dashboard')
      navigate('dashboard')
    }
  }, [user, navigate])

  // Si es un técnico, mostrar un mensaje mientras se redirige
  if (user?.role === 'technician') {
    return (
      <div className="container-fluid px-3 px-md-4 py-3">
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <ClipboardList size={60} className="text-warning mb-3" />
                <h3 className="h5 fw-bold text-dark mb-3">Acceso No Permitido</h3>
                <p className="text-muted mb-3">Los técnicos no pueden crear órdenes de servicio.</p>
                <p className="text-muted">Redirigiendo al dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Estados para el cliente
  const [cedula, setCedula] = useState('')
  const [customer, setCustomer] = useState<any>(null)
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  
  // Estados para el nuevo cliente
  const [newCustomer, setNewCustomer] = useState({
    cedula: '',
    full_name: '',
    phone: '',
    email: '',
  })
  
  // Estados para la orden de servicio
  const [orderData, setOrderData] = useState({
    device_type: '',
    device_brand: '',
    device_model: '',
    serial_number: '',
    problem_description: '',
    observations: '',
    estimated_completion: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  
  // Estados para la comanda
  const [showComanda, setShowComanda] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  
  // Estado para el modal
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  })
  
  const { getCustomerByCedula, createCustomer } = useCustomers()
  const { createServiceOrder } = useServiceOrders()

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }))
  }

  const showSuccessModal = (message: string) => {
    setModal({
      isOpen: true,
      type: 'success',
      title: '¡Éxito!',
      message
    })
  }

  const handleSearchCustomer = async () => {
    if (!cedula.trim()) return
    
    setLoading(true)
    const foundCustomer = await getCustomerByCedula(cedula.trim())
    
    if (foundCustomer) {
      setCustomer(foundCustomer)
      setShowNewCustomerForm(false)
    } else {
      setCustomer(null)
      setNewCustomer({ ...newCustomer, cedula: cedula.trim() })
      setShowNewCustomerForm(true)
    }
    setLoading(false)
  }

  const handleCreateCustomer = async () => {
    if (!newCustomer.cedula.trim() || !newCustomer.full_name.trim()) {
      return
    }
    
    const createdCustomer = await createCustomer(newCustomer)
    if (createdCustomer) {
      setCustomer(createdCustomer)
      setShowNewCustomerForm(false)
      setNewCustomer({ cedula: '', full_name: '', phone: '', email: '' })
    }
  }

  const handleCreateOrder = async () => {
    if (!customer) return
    
    if (!orderData.device_type || !orderData.device_brand || !orderData.problem_description) {
      return
    }
    
    setCreating(true)
    const success = await createServiceOrder({
      customer_id: customer.id,
      ...orderData,
    })
    
    if (success) {
      // Buscar la orden recién creada para mostrar la comanda
      try {
        const { data: orders } = await supabase
          .from('service_orders')
          .select('*, customers(*)')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false })
          .limit(1)
        
        if (orders && orders.length > 0) {
          setCreatedOrder(orders[0])
          setShowComanda(true)
        }
      } catch (error) {
        console.error('Error buscando orden creada:', error)
      }
      
      showSuccessModal('Orden creada')
      // Limpiar formulario después de 3 segundos
      setTimeout(() => {
        setCustomer(null)
        setCedula('')
        setShowNewCustomerForm(false)
        setOrderData({
          device_type: '',
          device_brand: '',
          device_model: '',
          serial_number: '',
          problem_description: '',
          observations: '',
          estimated_completion: '',
        })
        closeModal()
      }, 3000)
    }
    setCreating(false)
  }

  const deviceTypes = ['Consola', 'Control', 'Accesorio', 'Otro']
  const brands = ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Otro']

  const handleClearForm = () => {
    setCustomer(null)
    setCedula('')
    setShowNewCustomerForm(false)
    setNewCustomer({ cedula: '', full_name: '', phone: '', email: '' })
    setOrderData({
      device_type: '',
      device_brand: '',
      device_model: '',
      serial_number: '',
      problem_description: '',
      observations: '',
      estimated_completion: '',
    })
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
                  <h1 className="h4 fw-bold mb-2">Nueva Orden de Servicio</h1>
                  <p className="mb-0 opacity-90">Registra un nuevo dispositivo para reparación</p>
                  <small className="opacity-75">Proceso paso a paso para crear órdenes</small>
                </div>
                <div className="col-md-3 text-end d-none d-md-block">
                  <ClipboardList size={60} className="opacity-25" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Paso 1: Búsqueda de cliente */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 py-3">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '32px', height: '32px'}}>
                  <span className="fw-bold">1</span>
                </div>
                <Search size={18} className="me-2 text-primary" />
                Buscar Cliente
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Número de Cédula</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <User size={16} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Ingresa el número de cédula del cliente"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchCustomer()}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <button 
                    onClick={handleSearchCustomer} 
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
              
              {customer && (
                <div className="mt-4">
                  <div className="alert alert-success border-0 shadow-sm d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                      <User size={20} className="text-success" />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="alert-heading mb-2 fw-bold">✅ Cliente Encontrado</h6>
                      <div className="row g-2 small">
                        <div className="col-md-6">
                          <strong>Nombre:</strong> {customer.full_name}
                        </div>
                        <div className="col-md-6">
                          <strong>Cédula:</strong> {customer.cedula}
                        </div>
                        <div className="col-md-6">
                          <strong>Teléfono:</strong> {customer.phone || 'No registrado'}
                        </div>
                        <div className="col-md-6">
                          <strong>Email:</strong> {customer.email || 'No registrado'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Paso 2: Registro de nuevo cliente */}
      {showNewCustomerForm && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0 py-3">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '32px', height: '32px'}}>
                    <span className="fw-bold">2</span>
                  </div>
                  <UserPlus size={18} className="me-2 text-warning" />
                  Registrar Nuevo Cliente
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Cédula <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCustomer.cedula}
                      onChange={(e) => setNewCustomer({ ...newCustomer, cedula: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Nombre Completo <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCustomer.full_name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+57 300 123 4567"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="cliente@email.com"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <button onClick={handleCreateCustomer} className="btn btn-warning">
                      <Plus size={16} className="me-2" />
                      Registrar Cliente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 3: Detalles de la reparación */}
      {customer && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0 py-3">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '32px', height: '32px'}}>
                    <span className="fw-bold">3</span>
                  </div>
                  <Package size={18} className="me-2 text-success" />
                  Detalles de la Reparación
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Tipo de Dispositivo <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={orderData.device_type}
                      onChange={(e) => setOrderData({ ...orderData, device_type: e.target.value })}
                      required
                    >
                      <option value="">Selecciona el tipo</option>
                      {deviceTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Marca <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={orderData.device_brand}
                      onChange={(e) => setOrderData({ ...orderData, device_brand: e.target.value })}
                      required
                    >
                      <option value="">Selecciona la marca</option>
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Modelo</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: PS5, Xbox Series X, Switch"
                      value={orderData.device_model}
                      onChange={(e) => setOrderData({ ...orderData, device_model: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Número de Serie</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: ABC123456789"
                      value={orderData.serial_number}
                      onChange={(e) => setOrderData({ ...orderData, serial_number: e.target.value })}
                    />
                    <div className="form-text">Opcional - Número de serie del dispositivo</div>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Descripción del Problema <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Describe el problema reportado por el cliente..."
                      value={orderData.problem_description}
                      onChange={(e) => setOrderData({ ...orderData, problem_description: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Observaciones</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Observaciones adicionales, notas técnicas, etc..."
                      value={orderData.observations}
                      onChange={(e) => setOrderData({ ...orderData, observations: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Fecha Estimada de Finalización</label>
                    <input
                      type="date"
                      className="form-control"
                      value={orderData.estimated_completion}
                      onChange={(e) => setOrderData({ ...orderData, estimated_completion: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="d-flex gap-2 mt-4">
                  <button 
                    onClick={handleCreateOrder}
                    disabled={creating || !orderData.device_type || !orderData.device_brand || !orderData.problem_description}
                    className="btn btn-success flex-grow-1"
                  >
                    {creating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creando Orden...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="me-2" />
                        Crear Orden de Servicio
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleClearForm}
                    className="btn btn-outline-secondary"
                  >
                    Limpiar Formulario
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Comanda de Impresión */}
      {showComanda && createdOrder && (
        <div className="row mt-4">
          <div className="col-12">
            <ComandaPreview
              order={createdOrder}
              customer={createdOrder.customers}
              onClose={() => {
                setShowComanda(false)
                setCreatedOrder(null)
              }}
            />
          </div>
        </div>
      )}
      
      {/* Custom Modal */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  )
}

export default CreateOrder
