import React, { createContext, useContext, useState } from 'react'

export type Page = 'dashboard' | 'orders' | 'customers' | 'technicians' | 'settings' | 'create-order'

interface RouterContextType {
  currentPage: Page
  navigate: (page: Page) => void
}

const RouterContext = createContext<RouterContextType | undefined>(undefined)

export const useRouter = () => {
  const context = useContext(RouterContext)
  if (context === undefined) {
    throw new Error('useRouter must be used within a RouterProvider')
  }
  return context
}

interface RouterProviderProps {
  children: React.ReactNode
}

export const RouterProvider: React.FC<RouterProviderProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const navigate = (page: Page) => {
    setCurrentPage(page)
  }

  const value = {
    currentPage,
    navigate,
  }

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}
