import React, { useState } from 'react'
import { useCustomersDemo } from '../hooks/useCustomersDemo'
import { useServiceOrdersDemo } from '../hooks/useServiceOrdersDemo'
import Card from './ui/Card'
import Input from './ui/Input'
import Button from './ui/Button'
import { Search, User, Clock, CheckCircle, Package } from 'lucide-react'

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'in_progress': return <User className="w-4 h-4 text-blue-600" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'delivered': return <Package className="w-4 h-4 text-gray-600" />
      default: return null
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completada',
      delivered: 'Entregada'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Búsqueda de Clientes</h1>
      
      {/* Formulario de búsqueda */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Buscar Cliente por Cédula</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Ingresa el número de cédula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            onClick={handleSearch}
            loading={loading}
            className="flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
        </div>
      </Card>

      {/* Resultado de búsqueda */}
      {notFound && (
        <Card>
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cliente no encontrado</h3>
            <p className="text-gray-500">No se encontró ningún cliente con la cédula: {cedula}</p>
            <Button className="mt-4" variant="secondary">
              Registrar Nuevo Cliente
            </Button>
          </div>
        </Card>
      )}

      {customer && (
        <>
          {/* Información del cliente */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <p className="text-gray-900">{customer.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula
                </label>
                <p className="text-gray-900">{customer.cedula}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <p className="text-gray-900">{customer.phone || 'No registrado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{customer.email || 'No registrado'}</p>
              </div>
            </div>
          </Card>

          {/* Historial de órdenes */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Historial de Órdenes de Servicio
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {customerOrders.length} órdenes
              </span>
            </div>
            
            {customerOrders.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Este cliente no tiene órdenes de servicio registradas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customerOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {order.device_brand} {order.device_model}
                        </h3>
                        <p className="text-sm text-gray-600">{order.device_type}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Problema Reportado
                      </label>
                      <p className="text-sm text-gray-900">{order.problem_description}</p>
                    </div>
                    
                    {order.completion_notes && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Trabajo Realizado
                        </label>
                        <p className="text-sm text-gray-900">{order.completion_notes}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>
                        Creada: {new Date(order.created_at).toLocaleDateString()}
                      </span>
                      {order.assigned_technician && (
                        <span>
                          Técnico: {order.assigned_technician.full_name}
                        </span>
                      )}
                    </div>

                    {order.status === 'completed' && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <Button size="sm" variant="success" className="w-full">
                          Marcar como Entregada
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

export default CustomerSearch
