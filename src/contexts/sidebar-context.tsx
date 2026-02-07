/**
 * Contexto para compartir el estado de la sidebar entre componentes
 */

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type SidebarContextType = {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  isMobile: boolean
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Estado del colapso (persistido en localStorage)
  const [collapsed, setCollapsedState] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Cargar estado desde localStorage al montar
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed')
    if (savedCollapsed !== null) {
      setCollapsedState(savedCollapsed === 'true')
    }

    // Detectar si es móvil
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setCollapsedState(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Guardar estado en localStorage cuando cambia
  const setCollapsed = (value: boolean) => {
    setCollapsedState(value)
    localStorage.setItem('sidebar-collapsed', String(value))
  }

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, isMobile, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
