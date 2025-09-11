import { AuthProvider, useAuth } from './contexts/AuthContext'
import { RouterProvider } from './contexts/RouterContext'
import Login from './components/Login'
import Layout from './components/Layout'
import PageRenderer from './components/PageRenderer'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Layout>
      <PageRenderer />
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  )
}

export default App
