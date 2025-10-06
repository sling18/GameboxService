import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useCustomers } from '../hooks/useCustomers'
import { useServiceOrders } from '../hooks/useServiceOrders'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from '../contexts/RouterContext'
import { Search, Plus, Save, User, UserPlus, Package, ClipboardList, Trash2, Copy, List } from 'lucide-react'
import { CustomModal } from './ui/CustomModal'
import ComandaPreview from './ComandaPreview'
import MultipleOrdersComandaPreview from './MultipleOrdersComandaPreview'
import type { DeviceItem } from '../types'
import { sanitizeInput } from '../utils/sanitization'
import { validators } from '../utils/validation'
import { handleError } from '../utils/errorHandler'

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
  })

  // Estados para múltiples dispositivos
  const [devices, setDevices] = useState<DeviceItem[]>([])
  const [currentDevice, setCurrentDevice] = useState<DeviceItem>({
    device_type: '',
    device_brand: '',
    device_model: '',
    serial_number: '',
    problem_description: '',
    observations: '',
  })
  const [multipleDeviceMode, setMultipleDeviceMode] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  
  // Estados para la comanda
  const [showComanda, setShowComanda] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const [showMultipleComanda, setShowMultipleComanda] = useState(false)
  const [createdOrders, setCreatedOrders] = useState<any[]>([])
  
  // Estado para el modal
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  })
  
  const { getCustomerByCedula, createCustomer } = useCustomers()
  const { createServiceOrder, createMultipleDeviceOrder } = useServiceOrders()

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

  const showErrorModal = (message: string) => {
    setModal({
      isOpen: true,
      type: 'error',
      title: '¡Error!',
      message
    })
  }

  const handleSearchCustomer = async () => {
    // Sanitizar y validar cédula
    const sanitizedCedula = sanitizeInput.cedula(cedula)
    
    if (!sanitizedCedula) {
      showErrorModal('Por favor ingrese una cédula')
      return
    }

    // Validar formato de cédula
    const cedulaError = validators.cedula(sanitizedCedula)
    if (cedulaError) {
      showErrorModal(cedulaError)
      return
    }
    
    setLoading(true)
    try {
      const foundCustomer = await getCustomerByCedula(sanitizedCedula)
      
      if (foundCustomer) {
        setCustomer(foundCustomer)
        setShowNewCustomerForm(false)
      } else {
        setCustomer(null)
        setNewCustomer({ ...newCustomer, cedula: sanitizedCedula })
        setShowNewCustomerForm(true)
      }
    } catch (error) {
      const message = handleError(error, 'handleSearchCustomer')
      showErrorModal(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async () => {
    // Sanitizar todos los campos
    const sanitizedData = {
      cedula: sanitizeInput.cedula(newCustomer.cedula),
      full_name: sanitizeInput.name(newCustomer.full_name),
      phone: sanitizeInput.phone(newCustomer.phone),
      email: sanitizeInput.email(newCustomer.email),
    }

    // Validar campos requeridos
    if (!sanitizedData.cedula) {
      showErrorModal('La cédula es requerida')
      return
    }

    if (!sanitizedData.full_name) {
      showErrorModal('El nombre completo es requerido')
      return
    }

    // Validar formato de cédula
    const cedulaError = validators.cedula(sanitizedData.cedula)
    if (cedulaError) {
      showErrorModal(cedulaError)
      return
    }

    // Validar formato de email si fue proporcionado
    if (sanitizedData.email) {
      const emailError = validators.email(sanitizedData.email)
      if (emailError) {
        showErrorModal(emailError)
        return
      }
    }

    // Validar formato de teléfono si fue proporcionado
    if (sanitizedData.phone) {
      const phoneError = validators.phone(sanitizedData.phone)
      if (phoneError) {
        showErrorModal(phoneError)
        return
      }
    }
    
    try {
      const createdCustomer = await createCustomer(sanitizedData)
      if (createdCustomer) {
        setCustomer(createdCustomer)
        setShowNewCustomerForm(false)
        setNewCustomer({ cedula: '', full_name: '', phone: '', email: '' })
      }
    } catch (error) {
      const message = handleError(error, 'handleCreateCustomer')
      showErrorModal(message)
    }
  }

  const handleCreateOrder = async () => {
    if (!customer) {
      showErrorModal('Debe seleccionar un cliente')
      return
    }
    
    // Validar campos requeridos
    if (!orderData.device_type || !orderData.device_brand || !orderData.problem_description) {
      showErrorModal('Por favor complete todos los campos obligatorios')
      return
    }

    // Sanitizar datos antes de enviar
    const sanitizedOrderData = {
      device_type: sanitizeInput.text(orderData.device_type),
      device_brand: sanitizeInput.text(orderData.device_brand),
      device_model: sanitizeInput.text(orderData.device_model),
      serial_number: sanitizeInput.text(orderData.serial_number),
      problem_description: sanitizeInput.text(orderData.problem_description),
      observations: sanitizeInput.text(orderData.observations),
    }
    
    setCreating(true)
    try {
      const success = await createServiceOrder({
        customer_id: customer.id,
        ...sanitizedOrderData,
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
        
        // NO limpiar automáticamente - el usuario decidirá cuándo cerrar la comanda
        // El formulario se limpiará cuando cierre la comanda manualmente
      }
    } catch (error) {
      const message = handleError(error, 'handleCreateOrder')
      showErrorModal(message)
    } finally {
      setCreating(false)
    }
  }

  // Funciones para múltiples dispositivos
  const addDeviceToList = () => {
    if (!currentDevice.device_type || !currentDevice.device_brand || 
        !currentDevice.device_model || !currentDevice.problem_description) {
      showErrorModal('Por favor complete todos los campos obligatorios del dispositivo')
      return
    }

    // Sanitizar el dispositivo antes de agregarlo a la lista
    const sanitizedDevice: DeviceItem = {
      device_type: sanitizeInput.text(currentDevice.device_type),
      device_brand: sanitizeInput.text(currentDevice.device_brand),
      device_model: sanitizeInput.text(currentDevice.device_model),
      serial_number: sanitizeInput.text(currentDevice.serial_number || ''),
      problem_description: sanitizeInput.text(currentDevice.problem_description),
      observations: sanitizeInput.text(currentDevice.observations || ''),
    }

    setDevices(prev => [...prev, sanitizedDevice])
    setCurrentDevice({
      device_type: '',
      device_brand: '',
      device_model: '',
      serial_number: '',
      problem_description: '',
      observations: '',
    })
  }

  const removeDeviceFromList = (index: number) => {
    setDevices(prev => prev.filter((_, i) => i !== index))
  }

  const duplicateDevice = (index: number) => {
    const deviceToDuplicate = devices[index]
    setDevices(prev => [...prev, { ...deviceToDuplicate }])
  }

  const handleCreateMultipleOrders = async () => {
    if (!customer) {
      showErrorModal('Seleccione un cliente')
      return
    }

    if (devices.length === 0) {
      showErrorModal('Agregue al menos un dispositivo')
      return
    }

    setCreating(true)
    
    try {
      const success = await createMultipleDeviceOrder({
        customer_id: customer.id,
        devices: devices,
      })
      
      if (success && success.length > 0) {
        // Mostrar comanda múltiple
        setCreatedOrders(success)
        setShowMultipleComanda(true)
        
        showSuccessModal(`${success.length} órdenes creadas exitosamente`)
        
        // NO limpiar automáticamente - el usuario decidirá cuándo cerrar la comanda
        // El formulario se limpiará cuando cierre la comanda manualmente
      }
    } catch (error) {
      const message = handleError(error, 'handleCreateMultipleOrders')
      showErrorModal(message)
    } finally {
      setCreating(false)
    }
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
    })
  }

  const handleCloseMultipleComanda = () => {
    // Cerrar la comanda múltiple
    setShowMultipleComanda(false)
    setCreatedOrders([])
    
    // Limpiar formulario completamente después de revisar/imprimir la comanda
    setCustomer(null)
    setCedula('')
    setShowNewCustomerForm(false)
    setDevices([])
    setCurrentDevice({
      device_type: '',
      device_brand: '',
      device_model: '',
      serial_number: '',
      problem_description: '',
      observations: '',
    })
    setMultipleDeviceMode(false)
    setOrderData({
      device_type: '',
      device_brand: '',
      device_model: '',
      serial_number: '',
      problem_description: '',
      observations: '',
    })
    closeModal()
  }

  const handleCloseSingleComanda = () => {
    // Cerrar la comanda individual
    setShowComanda(false)
    setCreatedOrder(null)
    
    // Limpiar formulario completamente después de revisar/imprimir la comanda
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
    })
    closeModal()
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
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 me-sm-3 flex-shrink-0" style={{width: 'clamp(28px, 8vw, 36px)', height: 'clamp(28px, 8vw, 36px)', fontSize: 'clamp(12px, 3vw, 16px)'}}>
                  <span className="fw-bold">1</span>
                </div>
                <Search size={18} className="me-2 text-primary" />
                <span className="d-none d-sm-inline">Buscar Cliente</span>
                <span className="d-inline d-sm-none small">Buscar</span>
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-2 g-sm-3 align-items-end">
                <div className="col-12 col-sm-8">
                  <label className="form-label fw-semibold small">Número de Cédula</label>
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
                      style={{minHeight: '44px'}}
                    />
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <button 
                    onClick={handleSearchCustomer} 
                    disabled={loading}
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                    style={{minHeight: '44px'}}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        <span className="d-none d-sm-inline">Buscando...</span>
                        <span className="d-inline d-sm-none">...</span>
                      </>
                    ) : (
                      <>
                        <Search size={16} className="me-1 me-sm-2" />
                        <span className="d-none d-sm-inline">Buscar Cliente</span>
                        <span className="d-inline d-sm-none">Buscar</span>
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
                  <span className="d-none d-sm-inline">Registrar Nuevo Cliente</span>
                  <span className="d-inline d-sm-none small">Nuevo Cliente</span>
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-2 g-sm-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small">Cédula <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCustomer.cedula}
                      onChange={(e) => setNewCustomer({ ...newCustomer, cedula: e.target.value })}
                      required
                      style={{minHeight: '44px'}}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small">Nombre Completo <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCustomer.full_name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
                      required
                      style={{minHeight: '44px'}}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small">Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+57 300 123 4567"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      style={{minHeight: '44px'}}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="cliente@email.com"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      style={{minHeight: '44px'}}
                    />
                  </div>
                  <div className="col-12">
                    <button onClick={handleCreateCustomer} className="btn btn-warning w-100 w-sm-auto" style={{minHeight: '44px'}}>
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

      {/* Selector de Modo */}
      {customer && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-2 p-sm-3">
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                  <div className="btn-group w-100 w-sm-auto" role="group">
                    <input 
                      type="radio" 
                      className="btn-check" 
                      name="orderMode" 
                      id="single-device" 
                      checked={!multipleDeviceMode}
                      onChange={() => setMultipleDeviceMode(false)}
                    />
                    <label className="btn btn-outline-primary" htmlFor="single-device" style={{minHeight: '44px'}}>
                      <span className="d-none d-sm-inline">📱 Un Solo Dispositivo</span>
                      <span className="d-inline d-sm-none">📱 Uno</span>
                    </label>

                    <input 
                      type="radio" 
                      className="btn-check" 
                      name="orderMode" 
                      id="multiple-devices" 
                      checked={multipleDeviceMode}
                      onChange={() => setMultipleDeviceMode(true)}
                    />
                    <label className="btn btn-outline-primary" htmlFor="multiple-devices" style={{minHeight: '44px'}}>
                      <span className="d-none d-sm-inline">📦 Múltiples Dispositivos</span>
                      <span className="d-inline d-sm-none">📦 Varios</span>
                    </label>
                  </div>
                </div>
                {multipleDeviceMode && (
                  <div className="mt-2 mt-sm-3 text-center">
                    <small className="text-muted">
                      💡 <span className="d-none d-sm-inline">Perfecto para clientes que traen varios equipos a reparar</span><span className="d-inline d-sm-none">Para varios equipos</span>
                    </small>
                  </div>
                )}
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
              <div className="card-header bg-transparent border-0 py-2 py-sm-3">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-2 me-sm-3 flex-shrink-0" style={{width: 'clamp(28px, 8vw, 36px)', height: 'clamp(28px, 8vw, 36px)', fontSize: 'clamp(12px, 3vw, 16px)'}}>
                    <span className="fw-bold">3</span>
                  </div>
                  <Package size={18} className="me-2 text-success" />
                  <span className="d-none d-sm-inline">{multipleDeviceMode ? 'Múltiples Dispositivos' : 'Detalles de la Reparación'}</span>
                  <span className="d-inline d-sm-none small">{multipleDeviceMode ? 'Dispositivos' : 'Reparación'}</span>
                </h5>
              </div>
              <div className="card-body">
                {multipleDeviceMode ? (
                  <>
                    {/* Lista de dispositivos agregados */}
                    {devices.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-muted mb-3">
                          <List size={16} className="me-2" />
                          Dispositivos Agregados ({devices.length})
                        </h6>
                        <div className="row g-2">
                          {devices.map((device, index) => (
                            <div key={index} className="col-12">
                              <div className="card border-start border-primary border-3">
                                <div className="card-body p-2 p-sm-3">
                                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2">
                                    <div className="flex-grow-1 min-w-0">
                                      <strong className="d-block text-truncate">{device.device_type} - {device.device_brand}</strong>
                                      {device.device_model && <span className="text-muted small"> ({device.device_model})</span>}
                                      <br />
                                      <small className="text-muted d-block text-truncate">{device.problem_description}</small>
                                    </div>
                                    <div className="d-flex gap-1 flex-shrink-0">
                                      <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => duplicateDevice(index)}
                                        title="Duplicar dispositivo"
                                        style={{minWidth: '44px', minHeight: '44px'}}
                                      >
                                        <Copy size={16} />
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => removeDeviceFromList(index)}
                                        title="Eliminar dispositivo"
                                        style={{minWidth: '44px', minHeight: '44px'}}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formulario para agregar dispositivo */}
                    <div className="card bg-light">
                      <div className="card-header py-2">
                        <h6 className="mb-0">
                          <Plus size={16} className="me-2" />
                          Agregar Dispositivo
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-2 g-sm-3">
                          <div className="col-12 col-sm-6 col-md-6">
                            <label className="form-label fw-semibold small">Tipo de Dispositivo <span className="text-danger">*</span></label>
                            <select
                              className="form-select"
                              value={currentDevice.device_type}
                              onChange={(e) => setCurrentDevice({ ...currentDevice, device_type: e.target.value })}
                              required
                              style={{minHeight: '44px'}}
                            >
                              <option value="">Selecciona el tipo</option>
                              {deviceTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="col-12 col-sm-6 col-md-6">
                            <label className="form-label fw-semibold small">Marca <span className="text-danger">*</span></label>
                            <select
                              className="form-select"
                              value={currentDevice.device_brand}
                              onChange={(e) => setCurrentDevice({ ...currentDevice, device_brand: e.target.value })}
                              required
                              style={{minHeight: '44px'}}
                            >
                              <option value="">Selecciona la marca</option>
                              {brands.map(brand => (
                                <option key={brand} value={brand}>{brand}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="col-12 col-sm-6 col-md-6">
                            <label className="form-label fw-semibold small">Modelo</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ej: PS5, Xbox Series X, Switch"
                              value={currentDevice.device_model}
                              onChange={(e) => setCurrentDevice({ ...currentDevice, device_model: e.target.value })}
                              style={{minHeight: '44px'}}
                            />
                          </div>
                          
                          <div className="col-12 col-sm-6 col-md-6">
                            <label className="form-label fw-semibold small">Número de Serie</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ej: ABC123456789"
                              value={currentDevice.serial_number}
                              onChange={(e) => setCurrentDevice({ ...currentDevice, serial_number: e.target.value })}
                              style={{minHeight: '44px'}}
                            />
                          </div>
                          
                          <div className="col-12">
                            <label className="form-label fw-semibold small">Descripción del Problema <span className="text-danger">*</span></label>
                            <textarea
                              className="form-control"
                              rows={3}
                              placeholder="Describe el problema reportado por el cliente..."
                              value={currentDevice.problem_description}
                              onChange={(e) => setCurrentDevice({ ...currentDevice, problem_description: e.target.value })}
                              required
                              style={{minHeight: '80px'}}
                            />
                          </div>
                          
                          <div className="col-12">
                            <label className="form-label fw-semibold small">Observaciones</label>
                            <textarea
                              className="form-control"
                              rows={2}
                              placeholder="Observaciones adicionales..."
                              value={currentDevice.observations}
                              onChange={(e) => setCurrentDevice({ ...currentDevice, observations: e.target.value })}
                              style={{minHeight: '60px'}}
                            />
                          </div>
                        </div>
                        
                        <div className="d-flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={addDeviceToList}
                            disabled={!currentDevice.device_type || !currentDevice.device_brand || !currentDevice.problem_description}
                            className="btn btn-primary"
                          >
                            <Plus size={16} className="me-2" />
                            Agregar a la Lista
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentDevice({
                              device_type: '',
                              device_brand: '',
                              device_model: '',
                              serial_number: '',
                              problem_description: '',
                              observations: ''
                            })}
                            className="btn btn-outline-secondary"
                          >
                            Limpiar Campos
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción para múltiples dispositivos */}
                    <div className="d-flex flex-column flex-sm-row gap-2 mt-3 mt-sm-4">
                      <button 
                        onClick={handleCreateMultipleOrders}
                        disabled={creating || devices.length === 0}
                        className="btn btn-success flex-grow-1"
                        style={{minHeight: '44px'}}
                      >
                        {creating ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            <span className="d-none d-sm-inline">Creando Órdenes...</span>
                            <span className="d-inline d-sm-none">Creando...</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} className="me-1 me-sm-2" />
                            <span className="d-none d-sm-inline">Crear {devices.length} Orden{devices.length !== 1 ? 'es' : ''} de Servicio</span>
                            <span className="d-inline d-sm-none">Crear ({devices.length})</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => {
                          setDevices([])
                          setCurrentDevice({
                            device_type: '',
                            device_brand: '',
                            device_model: '',
                            serial_number: '',
                            problem_description: '',
                            observations: ''
                          })
                        }}
                        className="btn btn-outline-secondary"
                      >
                        Limpiar Todo
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Modo de dispositivo único */}
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
                    </div>

                    {/* Botones de acción para dispositivo único */}
                    <div className="d-flex flex-column flex-sm-row gap-2 mt-3 mt-sm-4">
                      <button 
                        onClick={handleCreateOrder}
                        disabled={creating || !orderData.device_type || !orderData.device_brand || !orderData.problem_description}
                        className="btn btn-success flex-grow-1"
                        style={{minHeight: '44px'}}
                      >
                        {creating ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            <span className="d-none d-sm-inline">Creando Orden...</span>
                            <span className="d-inline d-sm-none">Creando...</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} className="me-1 me-sm-2" />
                            <span className="d-none d-sm-inline">Crear Orden de Servicio</span>
                            <span className="d-inline d-sm-none">Crear Orden</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={handleClearForm}
                        className="btn btn-outline-secondary"
                        style={{minHeight: '44px'}}
                      >
                        <span className="d-none d-sm-inline">Limpiar Formulario</span>
                        <span className="d-inline d-sm-none">Limpiar</span>
                      </button>
                    </div>
                  </>
                )}
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
              onClose={handleCloseSingleComanda}
            />
          </div>
        </div>
      )}

      {/* Comanda Múltiple de Impresión */}
      {showMultipleComanda && createdOrders.length > 0 && customer && (
        <div className="row mt-4">
          <div className="col-12">
            <MultipleOrdersComandaPreview
              orders={createdOrders}
              customer={customer}
              onClose={handleCloseMultipleComanda}
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
