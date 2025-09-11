import React, { useState } from 'react'
import { useCustomers } from '../hooks/useCustomers'
import { useServiceOrders } from '../hooks/useServiceOrders'
import { Search, Plus, Save, User, UserPlus, Package, ClipboardList, AlertTriangle } from 'lucide-react'
import { CustomModal } from './ui/CustomModal'

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
    problem_description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimated_completion: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  
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
          problem_description: '',
          priority: 'medium',
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
      problem_description: '',
      priority: 'medium',
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
                    <label className="form-label fw-semibold">Prioridad</label>
                    <select
                      className="form-select"
                      value={orderData.priority}
                      onChange={(e) => setOrderData({ ...orderData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold">Descripción del Problema <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Describe detalladamente el problema reportado por el cliente..."
                      value={orderData.problem_description}
                      onChange={(e) => setOrderData({ ...orderData, problem_description: e.target.value })}
                      required
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

                {/* Priority Alert */}
                {orderData.priority === 'high' && (
                  <div className="alert alert-warning border-0 shadow-sm mt-3 d-flex align-items-center">
                    <AlertTriangle size={20} className="me-2 text-warning" />
                    <div>
                      <strong>Prioridad Alta:</strong> Esta orden será marcada como urgente y aparecerá en la parte superior de la cola de reparaciones.
                    </div>
                  </div>
                )}

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
