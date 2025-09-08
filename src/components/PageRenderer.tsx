import React from 'react'
import { useRouter } from '../contexts/RouterContext'
import Dashboard from './Dashboard'
import ServiceQueue from './ServiceQueue'
import CustomerSearch from './CustomerSearch'
import CreateOrder from './CreateOrder'
import { Construction } from 'lucide-react'
import Card from './ui/Card'

const PageRenderer: React.FC = () => {
  const { currentPage } = useRouter()

  const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
    <Card>
      <div className="text-center py-12">
        <Construction className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
      </div>
    </Card>
  )

  switch (currentPage) {
    case 'dashboard':
      return <Dashboard />
    case 'orders':
      return <ServiceQueue />
    case 'customers':
      return <CustomerSearch />
    case 'create-order':
      return <CreateOrder />
    case 'technicians':
      return <ComingSoon title="Gestión de Técnicos" />
    case 'settings':
      return <ComingSoon title="Configuración del Sistema" />
    default:
      return <Dashboard />
  }
}

export default PageRenderer
