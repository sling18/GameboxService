import React from 'react'
import { useRouter } from '../contexts/RouterContext'
import Dashboard from './Dashboard'
import ServiceQueue from './ServiceQueue'
import CustomerSearch from './CustomerSearch'
import CreateOrder from './CreateOrder'
import TechniciansManagement from './TechniciansManagement'
import { Construction } from 'lucide-react'

const PageRenderer: React.FC = () => {
  const { currentPage } = useRouter()

  const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
    <div className="container-fluid px-3 px-md-4 py-3">
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <Construction size={80} className="text-muted mb-4" />
              <h2 className="h4 fw-bold text-dark mb-3">{title}</h2>
              <p className="text-muted mb-0">Esta funcionalidad estará disponible próximamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      return <TechniciansManagement />
    case 'settings':
      return <ComingSoon title="Configuración del Sistema" />
    default:
      return <Dashboard />
  }
}

export default PageRenderer
