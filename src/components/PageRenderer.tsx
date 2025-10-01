import React, { lazy, Suspense } from 'react'
import { useRouter } from '../contexts/RouterContext'
import { Construction } from 'lucide-react'

// Lazy loading de componentes para code splitting
const Dashboard = lazy(() => import('./Dashboard'))
const ServiceQueue = lazy(() => import('./ServiceQueue'))
const CustomerSearch = lazy(() => import('./CustomerSearch'))
const CreateOrder = lazy(() => import('./CreateOrder'))
const TechniciansManagement = lazy(() => import('./TechniciansManagement'))

// Componente de carga mientras se cargan los componentes lazy
const LoadingFallback: React.FC = () => (
  <div className="container-fluid px-3 px-md-4 py-3">
    <div className="row">
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted mb-0">Cargando módulo...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

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

  // Renderizar componente con Suspense para lazy loading
  const renderPage = () => {
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

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderPage()}
    </Suspense>
  )
}

export default PageRenderer
