import React, { useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  Trash2, 
  Edit3, 
  Shield, 
  User, 
  UserCheck,
  Save,
  X,
  Crown,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import type { UserRole } from '../types'
import { CustomModal } from './ui/CustomModal'

interface ModalState {
  isOpen: boolean
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  title: string
  message: string
  onConfirm?: () => void
  showCancel?: boolean
  confirmText?: string
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth()
  const { users, loading, error, deleteUser, updateUserRole, refreshUsers } = useUsers()
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [newUserRole, setNewUserRole] = useState<UserRole>('receptionist')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  
  // Estado para el modal
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  })

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }))
  }

  const showSuccessModal = (message: string) => {
    setModal({
      isOpen: true,
      type: 'success',
      title: '¡Éxito!',
      message
    })
  }

  const showErrorModal = (message: string) => {
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Error',
      message
    })
  }

  const showConfirmModal = (message: string, onConfirm: () => void, confirmText: string = 'Confirmar') => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Confirmar Acción',
      message,
      showCancel: true,
      confirmText,
      onConfirm
    })
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (userId === currentUser?.id) {
      showErrorModal('No puedes eliminar tu propia cuenta')
      return
    }

    showConfirmModal(
      `¿Estás seguro de eliminar a ${userEmail}?\n\nNOTA: Esto solo elimina el perfil. Para eliminar completamente ve al dashboard de Supabase.`,
      async () => {
        setDeleteLoading(userId)
        
        const result = await deleteUser(userId)
        
        if (result.error) {
          showErrorModal(`Error: ${result.error}`)
        } else {
          showSuccessModal('Perfil eliminado exitosamente')
        }

        setDeleteLoading(null)
        closeModal()
      },
      'Eliminar Usuario'
    )
  }

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    const result = await updateUserRole(userId, newRole)
    
    if (result.error) {
      showErrorModal(`Error: ${result.error}`)
    } else {
      setEditingUser(null)
      showSuccessModal('Rol actualizado exitosamente')
    }
  }

  const forceAdminRole = async (userId: string, userEmail: string) => {
    showConfirmModal(
      `¿Convertir a ${userEmail} en ADMINISTRADOR?\n\nEsto le dará acceso completo al sistema.`,
      async () => {
        const result = await updateUserRole(userId, 'admin')
        
        if (result.error) {
          showErrorModal(`Error: ${result.error}`)
        } else {
          showSuccessModal(`${userEmail} ahora es administrador.\nPuede hacer logout y login de nuevo para ver los cambios.`)
        }
        closeModal()
      },
      'Sí, hacer Admin'
    )
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield size={16} className="text-danger" />
      case 'receptionist':
        return <UserCheck size={16} className="text-primary" />
      case 'technician':
        return <User size={16} className="text-success" />
    }
  }

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-danger'
      case 'receptionist':
        return 'bg-primary'
      case 'technician':
        return 'bg-success'
    }
  }

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'receptionist':
        return 'Recepcionista'
      case 'technician':
        return 'Técnico'
    }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="alert alert-warning d-flex align-items-center">
        <AlertCircle size={20} className="me-2" />
        Solo los administradores pueden gestionar usuarios.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando usuarios...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <Crown size={20} className="me-2" />
          <h5 className="mb-0">Gestión de Usuarios</h5>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button 
            onClick={refreshUsers}
            className="btn btn-light btn-sm"
            disabled={loading}
            title="Actualizar lista de usuarios"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          <span className="badge bg-light text-primary">{users.length} usuarios</span>
        </div>
      </div>

      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={16} className="me-2" />
            {error}
          </div>
        )}

        {/* Información sobre los usuarios mostrados */}
        <div className="alert alert-info d-flex align-items-start mb-4">
          <Users size={16} className="me-2 mt-1" />
          <div>
            <strong>Gestión de Roles de Usuario:</strong>
            <ul className="mb-0 mt-2 small">
              <li><strong>Crear usuarios:</strong> Ve a Supabase → Authentication → Users → "Invite a user"</li>
              <li><strong>Gestionar roles:</strong> Los usuarios aparecen aquí automáticamente</li>
              <li><strong>Cambiar rol:</strong> Usa el botón ✏️ para editar el rol de cualquier usuario</li>
              <li><strong>Actualizar:</strong> Usa el botón 🔄 si agregaste usuarios en Supabase</li>
            </ul>
          </div>
        </div>

        {/* Lista de usuarios */}
        {users.length === 0 ? (
          <div className="text-center py-4">
            <Users size={48} className="text-muted mb-3" />
            <h6 className="text-muted">No hay usuarios registrados</h6>
            <p className="small text-muted">Usa los botones de arriba para crear usuarios</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="border-0 fw-semibold">Usuario</th>
                  <th scope="col" className="border-0 fw-semibold">Rol</th>
                  <th scope="col" className="border-0 fw-semibold">Fecha</th>
                  <th scope="col" className="border-0 fw-semibold text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-2 me-3">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">{user.full_name}</h6>
                          <small className="text-muted">{user.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {editingUser === user.id ? (
                        <div className="d-flex align-items-center gap-2">
                          <select
                            className="form-select form-select-sm"
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                            style={{ maxWidth: '130px' }}
                          >
                            <option value="receptionist">Recepcionista</option>
                            <option value="technician">Técnico</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleUpdateRole(user.id, newUserRole)}
                            className="btn btn-sm btn-success"
                            title="Guardar"
                          >
                            <Save size={12} />
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="btn btn-sm btn-outline-secondary"
                            title="Cancelar"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className={`badge ${getRoleBadgeClass(user.role)} rounded-pill`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      )}
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </small>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {user.id !== currentUser?.id && (
                          <>
                            <button
                              onClick={() => {
                                setEditingUser(user.id)
                                setNewUserRole(user.role)
                              }}
                              className="btn btn-outline-primary"
                              title="Cambiar rol"
                              disabled={editingUser !== null}
                            >
                              <Edit3 size={12} />
                            </button>
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => forceAdminRole(user.id, user.email)}
                                className="btn btn-outline-warning"
                                title="Convertir en Admin"
                                disabled={editingUser !== null}
                              >
                                <Shield size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="btn btn-outline-danger"
                              title="Eliminar perfil"
                              disabled={deleteLoading === user.id || editingUser !== null}
                            >
                              {deleteLoading === user.id ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                <Trash2 size={12} />
                              )}
                            </button>
                          </>
                        )}
                        {user.id === currentUser?.id && (
                          <span className="badge bg-info text-dark small">Tu cuenta</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Custom Modal */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        showCancel={modal.showCancel}
        confirmText={modal.confirmText}
      />
    </div>
  )
}

export default UserManagement