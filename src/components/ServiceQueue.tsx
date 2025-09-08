import React from 'react'
import { useServiceOrdersDemo } from '../hooks/useServiceOrdersDemo'
import { useAuth } from '../contexts/AuthContextDemo'
import { useRouter } from '../contexts/RouterContext'
import Card from './ui/Card'
import Button from './ui/Button'
import { Clock, User, CheckCircle, Package, Plus } from 'lucide-react'

const ServiceQueue: React.FC = () => {
  const { serviceOrders, loading, assignTechnician, completeServiceOrder } = useServiceOrdersDemo()
  const { user } = useAuth()
  const { navigate } = useRouter()

  const handleTakeOrder = async (orderId: string) => {
    if (!user) return
    await assignTechnician(orderId, user.id)
  }

  const handleCompleteOrder = async (orderId: string) => {
    const notes = prompt('Ingresa las notas de completado:')
    if (notes) {
      await completeServiceOrder(orderId, notes)
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

  const StatusSection: React.FC<{ title: string; status: string; icon: any; color: string }> = ({ 
    title, 
    status, 
    icon: Icon, 
    color 
  }) => {
    const orders = getOrdersByStatus(status)
    
    if (orders.length === 0) {
      return (
        <Card>
          <div className="text-center py-8">
            <Icon className={`w-12 h-12 mx-auto mb-4 text-${color}-400`} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500">No hay órdenes {title.toLowerCase()}</p>
          </div>
        </Card>
      )
    }

    return (
      <Card>
        <div className="flex items-center mb-4">
          <Icon className={`w-6 h-6 mr-3 text-${color}-600`} />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className={`ml-auto px-2 py-1 text-sm rounded-full bg-${color}-100 text-${color}-800`}>
            {orders.length}
          </span>
        </div>
        
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {order.device_brand} {order.device_model}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Cliente: {order.customer?.full_name}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  order.priority === 'high' ? 'bg-red-100 text-red-800' :
                  order.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {order.priority === 'high' ? 'Alta' : 
                   order.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                {order.problem_description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
                
                {user?.role === 'technician' && (
                  <div className="space-x-2">
                    {status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleTakeOrder(order.id)}
                      >
                        Tomar Reparación
                      </Button>
                    )}
                    {status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        variant="success"
                        onClick={() => handleCompleteOrder(order.id)}
                      >
                        Completar
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              {order.assigned_technician && status !== 'pending' && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-1" />
                    Técnico: {order.assigned_technician.full_name}
                  </div>
                </div>
              )}
              
              {order.completion_notes && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-700">
                    <strong>Notas:</strong> {order.completion_notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'technician' ? 'Cola de Reparaciones' : 'Órdenes de Servicio'}
          </h1>
          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <Button onClick={() => navigate('create-order')} className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Orden
            </Button>
          )}
        </div>      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatusSection 
          title="Pendientes" 
          status="pending" 
          icon={Clock} 
          color="yellow"
        />
        <StatusSection 
          title="En Progreso" 
          status="in_progress" 
          icon={User} 
          color="blue"
        />
        <StatusSection 
          title="Completadas" 
          status="completed" 
          icon={CheckCircle} 
          color="green"
        />
        <StatusSection 
          title="Entregadas" 
          status="delivered" 
          icon={Package} 
          color="gray"
        />
      </div>
    </div>
  )
}

export default ServiceQueue
