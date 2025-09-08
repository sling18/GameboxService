import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContextDemo'
import { useRouter } from '../contexts/RouterContext'
import { 
  LogOut, 
  Home, 
  Users, 
  Wrench, 
  ClipboardList, 
  Settings,
  User,
  Menu,
  X,
  Shield,
  UserCheck,
  Gamepad2
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const { navigate, currentPage } = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigationItems = [
    { icon: Home, label: 'Dashboard', page: 'dashboard' as const, roles: ['admin', 'receptionist', 'technician'] },
    { icon: ClipboardList, label: 'Órdenes', page: 'orders' as const, roles: ['admin', 'receptionist', 'technician'] },
    { icon: Users, label: 'Clientes', page: 'customers' as const, roles: ['admin', 'receptionist'] },
    { icon: Wrench, label: 'Técnicos', page: 'technicians' as const, roles: ['admin'] },
    { icon: Settings, label: 'Configuración', page: 'settings' as const, roles: ['admin'] },
  ]

  const visibleItems = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  )

  const getRoleDisplay = (role: string) => {
    const roleMap = {
      admin: 'Administrador',
      receptionist: 'Recepcionista',
      technician: 'Técnico'
    }
    return roleMap[role as keyof typeof roleMap] || role
  }

  const getRoleIcon = (role: string) => {
    const roleIcons = {
      admin: Shield,
      receptionist: UserCheck,
      technician: Wrench
    }
    return roleIcons[role as keyof typeof roleIcons] || User
  }

  const getRoleColor = (role: string) => {
    const roleColors = {
      admin: 'primary',
      receptionist: 'success', 
      technician: 'warning'
    }
    return roleColors[role as keyof typeof roleColors] || 'secondary'
  }

  const RoleIcon = getRoleIcon(user?.role || '')
  const roleColor = getRoleColor(user?.role || '')

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" 
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav 
        className={`bg-white shadow-sm position-fixed position-lg-sticky top-0 start-0 h-100 d-flex flex-column ${
          sidebarOpen ? 'd-block' : 'd-none d-lg-block'
        }`}
        style={{ 
          width: '240px', 
          zIndex: 1050,
          borderRight: '1px solid #dee2e6',
          maxWidth: '240px',
          minWidth: '240px'
        }}
      >
        {/* Logo */}
        <div className="bg-primary text-white p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Gamepad2 size={20} className="me-2" />
              <h1 className="h6 mb-0 fw-bold">GameBox</h1>
            </div>
            <button 
              className="btn btn-link text-white p-0 d-lg-none"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-3 border-bottom">
          <div className="d-flex align-items-center">
            <div className={`bg-${roleColor} bg-opacity-10 rounded-circle p-2 me-2`}>
              <RoleIcon size={16} className={`text-${roleColor}`} />
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-0 fw-semibold text-truncate small">
                {user?.full_name || user?.email}
              </h6>
              <small className="text-muted">
                {getRoleDisplay(user?.role || '')}
              </small>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-grow-1 p-2">
          <div className="d-grid gap-1">
            {visibleItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.page
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    navigate(item.page)
                    setSidebarOpen(false)
                  }}
                  className={`btn text-start d-flex align-items-center py-2 px-3 ${
                    isActive 
                      ? `btn-${roleColor} bg-opacity-10 text-${roleColor} border-0` 
                      : 'btn-outline-light text-dark border-0 hover-card'
                  }`}
                >
                  <Icon size={16} className="me-2" />
                  <span className="fw-medium small">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sign Out */}
        <div className="p-2 border-top">
          <button
            onClick={signOut}
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center py-2"
          >
            <LogOut size={14} className="me-2" />
            <span className="small">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Mobile Header */}
        <header className="d-lg-none bg-white border-bottom p-3">
          <div className="d-flex align-items-center justify-content-between">
            <button 
              className="btn btn-outline-primary"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="h6 mb-0 fw-bold">GameBox Service</h1>
            <div className={`bg-${roleColor} bg-opacity-10 rounded-circle p-2`}>
              <RoleIcon size={16} className={`text-${roleColor}`} />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow-1 bg-light">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
