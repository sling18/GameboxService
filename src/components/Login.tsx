import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, User, Lock, Gamepad2, Monitor, Smartphone } from 'lucide-react'

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

    console.log('🔄 Intentando login con:', { email, password: '***' })
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error('❌ Error de login:', error)
        setError(`Error: ${error.message || 'Credenciales inválidas'}`)
      } else {
        console.log('✅ Login exitoso')
      }
    } catch (err) {
      console.error('❌ Error inesperado:', err)
      setError('Error de conexión. Verifica tu configuración.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                    <Gamepad2 size={40} className="text-primary" />
                    <h1 className="h3 fw-bold text-dark mb-0">GameBox Service</h1>
                  </div>
                  <p className="text-muted">Sistema de Gestión de Taller</p>
                </div>

                {/* Sistema de iconos */}
                <div className="row text-center mb-4">
                  <div className="col-4">
                    <Gamepad2 size={24} className="text-primary mb-2" />
                    <div className="small text-muted">Consolas</div>
                  </div>
                  <div className="col-4">
                    <Monitor size={24} className="text-success mb-2" />
                    <div className="small text-muted">Monitores</div>
                  </div>
                  <div className="col-4">
                    <Smartphone size={24} className="text-warning mb-2" />
                    <div className="small text-muted">Accesorios</div>
                  </div>
                </div>

                {/* Login form */}
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <User size={16} className="me-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      <Lock size={16} className="me-2" />
                      Contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <LogIn size={16} className="me-2" />
                        Iniciar Sesión
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login