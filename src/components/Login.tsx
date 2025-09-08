import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContextDemo'
import { LogIn, User, Lock, Shield, UserCheck, Wrench } from 'lucide-react'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setError('Credenciales inválidas')
    }
    
    setLoading(false)
  }

  const fillCredentials = (userEmail: string, userPassword: string) => {
    setEmail(userEmail)
    setPassword(userPassword)
    setError('')
  }

  return (
    <div className="login-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-8 col-md-6 col-lg-4">
            <div className="card login-card">
              {/* Header */}
              <div className="login-header">
                <div className="mb-3">
                  <div className="card-icon bg-primary bg-opacity-10 mx-auto" style={{width: '80px', height: '80px'}}>
                    <Shield size={40} className="text-primary" />
                  </div>
                </div>
                <h2 className="h3 fw-bold text-dark mb-2">GameBox Service</h2>
                <p className="text-muted mb-0">Sistema de Gestión de Reparaciones</p>
              </div>
              
              {/* Body */}
              <div className="login-body">
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      <User size={16} className="me-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      <Lock size={16} className="me-1" />
                      Contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <LogIn size={20} className="me-2" />
                        Iniciar Sesión
                      </>
                    )}
                  </button>
                </form>

                {/* Credenciales de demo */}
                <div className="border-top pt-4">
                  <h6 className="fw-semibold text-center mb-3">
                    <span className="badge bg-light text-dark">Credenciales de Demostración</span>
                  </h6>
                  
                  <div className="row g-2">
                    <div className="col-12">
                      <div 
                        className="card action-card border-primary" 
                        onClick={() => fillCredentials('admin@gameboxservice.com', 'gameboxservice123')}
                      >
                        <div className="card-body text-center p-3">
                          <Shield size={20} className="text-primary mb-1" />
                          <h6 className="card-title mb-1 text-primary">Administrador</h6>
                          <small className="text-muted">Control total del sistema</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div 
                        className="card action-card border-success" 
                        onClick={() => fillCredentials('recepcion@gameboxservice.com', 'gameboxservice123')}
                      >
                        <div className="card-body text-center p-3">
                          <UserCheck size={20} className="text-success mb-1" />
                          <h6 className="card-title mb-1 text-success">Recepcionista</h6>
                          <small className="text-muted">Atención al cliente</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div 
                        className="card action-card border-warning" 
                        onClick={() => fillCredentials('tecnico@gameboxservice.com', 'gameboxservice123')}
                      >
                        <div className="card-body text-center p-3">
                          <Wrench size={20} className="text-warning mb-1" />
                          <h6 className="card-title mb-1 text-warning">Técnico</h6>
                          <small className="text-muted">Reparaciones y mantenimiento</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Haz clic en cualquier tarjeta para usar las credenciales
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
