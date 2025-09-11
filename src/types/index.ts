export type UserRole = 'admin' | 'receptionist' | 'technician'

export type ServiceStatus = 'pending' | 'in_progress' | 'completed' | 'delivered'

export type Priority = 'low' | 'medium' | 'high'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  cedula: string
  full_name: string
  phone: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface ServiceOrder {
  id: string
  order_number: string
  customer_id: string
  device_type: string
  device_brand: string
  device_model: string
  problem_description: string
  status: ServiceStatus
  priority: Priority
  assigned_technician_id: string | null
  received_by_id: string
  estimated_completion: string | null
  completion_notes: string | null
  created_at: string
  updated_at: string
  // Relations
  customer?: Customer
  assigned_technician?: User
  received_by?: User
}

export interface CompanySettings {
  id: string
  company_name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  created_at: string
  updated_at: string
}

export interface CreateCustomerData {
  cedula: string
  full_name: string
  phone?: string
  email?: string
}

export interface CreateServiceOrderData {
  customer_id: string
  device_type: string
  device_brand: string
  device_model: string
  problem_description: string
  priority?: Priority
  estimated_completion?: string
}
