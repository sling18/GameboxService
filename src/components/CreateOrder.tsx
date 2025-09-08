import React, { useState } from 'react'
import { useCustomersDemo } from '../hooks/useCustomersDemo'
import { useServiceOrdersDemo } from '../hooks/useServiceOrdersDemo'
import Card from './ui/Card'
import Input from './ui/Input'
import Button from './ui/Button'
import { Search, Plus, Save } from 'lucide-react'

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
    priority: 'medium' as const,
    estimated_completion: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  
  const { getCustomerByCedula, createCustomer } = useCustomersDemo()
  const { createServiceOrder } = useServiceOrdersDemo()

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
    const createdCustomer = await createCustomer(newCustomer)
    if (createdCustomer) {
      setCustomer(createdCustomer)
      setShowNewCustomerForm(false)
      setNewCustomer({ cedula: '', full_name: '', phone: '', email: '' })
    }
  }

  const handleCreateOrder = async () => {
    if (!customer) return
    
    setCreating(true)
    const success = await createServiceOrder({
      customer_id: customer.id,
      ...orderData,
    })
    
    if (success) {
      // Limpiar formulario
      setCustomer(null)
      setCedula('')
      setOrderData({
        device_type: '',
        device_brand: '',
        device_model: '',
        problem_description: '',
        priority: 'medium',
        estimated_completion: '',
      })
      alert('Orden de servicio creada exitosamente')
    }
    setCreating(false)
  }

  const deviceTypes = ['Consola', 'Control', 'Accesorio', 'Otro']
  const brands = ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Otro']

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Orden de Servicio</h1>
      
      {/* Búsqueda de cliente */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Buscar Cliente</h2>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              label="Número de Cédula"
              placeholder="Ingresa el número de cédula del cliente"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchCustomer()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearchCustomer} loading={loading}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
        
        {customer && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Cliente Encontrado</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700 font-medium">Nombre:</span> {customer.full_name}
              </div>
              <div>
                <span className="text-green-700 font-medium">Cédula:</span> {customer.cedula}
              </div>
              <div>
                <span className="text-green-700 font-medium">Teléfono:</span> {customer.phone || 'No registrado'}
              </div>
              <div>
                <span className="text-green-700 font-medium">Email:</span> {customer.email || 'No registrado'}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Formulario nuevo cliente */}
      {showNewCustomerForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Registrar Nuevo Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Cédula"
              value={newCustomer.cedula}
              onChange={(e) => setNewCustomer({ ...newCustomer, cedula: e.target.value })}
              required
            />
            <Input
              label="Nombre Completo"
              value={newCustomer.full_name}
              onChange={(e) => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
              required
            />
            <Input
              label="Teléfono"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              placeholder="+57 300 123 4567"
            />
            <Input
              label="Email"
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              placeholder="cliente@email.com"
            />
          </div>
          <Button onClick={handleCreateCustomer} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Registrar Cliente
          </Button>
        </Card>
      )}

      {/* Formulario orden de servicio */}
      {customer && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Detalles de la Reparación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Dispositivo
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            
            <Input
              label="Modelo"
              value={orderData.device_model}
              onChange={(e) => setOrderData({ ...orderData, device_model: e.target.value })}
              placeholder="PS5, Xbox Series X, Switch OLED, etc."
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={orderData.priority}
                onChange={(e) => setOrderData({ ...orderData, priority: e.target.value as any })}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del Problema
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              value={orderData.problem_description}
              onChange={(e) => setOrderData({ ...orderData, problem_description: e.target.value })}
              placeholder="Describe detalladamente el problema reportado por el cliente..."
              required
            />
          </div>
          
          <Input
            label="Fecha Estimada de Completado (Opcional)"
            type="datetime-local"
            value={orderData.estimated_completion}
            onChange={(e) => setOrderData({ ...orderData, estimated_completion: e.target.value })}
          />
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button 
              onClick={handleCreateOrder} 
              loading={creating}
              size="lg"
              className="w-full flex items-center justify-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {creating ? 'Creando Orden...' : 'Crear Orden de Servicio'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default CreateOrder
