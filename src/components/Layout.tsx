import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from '../contexts/RouterContext'
import { 
  LogOut, 
  Home, 
  Users, 
  Wrench, 
  ClipboardList, 
  Settings,
  User,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-bottom">
        <nav className="navbar navbar-expand-lg navbar-light bg-white px-3 px-md-4">
          <div className="container-fluid">
            {/* Brand */}
            <div className="navbar-brand d-flex align-items-center mb-0">
              <Gamepad2 size={24} className="me-2 text-primary" />
              <span className="fw-bold fs-5">GameBox Service</span>
            </div>

            {/* Mobile menu button */}
            <button 
              className="navbar-toggler border-0 p-0" 
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Navigation Menu */}
            <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPage === item.page
                  return (
                    <li key={item.page} className="nav-item">
                      <button
                        onClick={() => {
                          navigate(item.page)
                          setMobileMenuOpen(false)
                        }}
                        className={`nav-link btn border-0 d-flex align-items-center px-3 py-2 ${
                          isActive 
                            ? `text-${roleColor} fw-semibold bg-${roleColor} bg-opacity-10 rounded` 
                            : 'text-dark hover-nav-link'
                        }`}
                      >
                        <Icon size={16} className="me-2" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              {/* User Info & Sign Out */}
              <div className="d-flex align-items-center">
                <div className="d-flex align-items-center me-3">
                  <div className={`bg-${roleColor} bg-opacity-10 rounded-circle p-2 me-2`}>
                    <RoleIcon size={16} className={`text-${roleColor}`} />
                  </div>
                  <div className="d-none d-md-block">
                    <div className="fw-semibold small text-truncate" style={{maxWidth: '150px'}}>
                      {user?.full_name || user?.email}
                    </div>
                    <small className="text-muted">
                      {getRoleDisplay(user?.role || '')}
                    </small>
                  </div>
                </div>
                
                <button
                  onClick={signOut}
                  className="btn btn-outline-danger btn-sm d-flex align-items-center"
                >
                  <LogOut size={14} className="me-1" />
                  <span className="d-none d-md-inline">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow-1 bg-light">
        {children}
      </main>
    </div>
  )
}

export default Layout
