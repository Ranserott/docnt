/**
 * Componente Client del Dashboard
 * Maneja el estado de la sidebar y el contenido principal
 */

'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@/lib/utils/cn'

function DashboardContentInner({ children }: { children: React.ReactNode }) {
  const { collapsed, isMobile } = useSidebar()

  return (
    <>
      {/* Sidebar fija */}
      <Sidebar />

      {/* Contenido principal - se ajusta al estado de la sidebar */}
      <div
        className={cn(
          'flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-all duration-300',
          // Margen izquierdo se ajusta al ancho de la sidebar
          !isMobile && (collapsed ? 'ml-20' : 'ml-72')
        )}
      >
        <Header />
        <main className="flex-1 p-4 pt-20 lg:p-6 lg:pt-20">
          {children}
        </main>
      </div>
    </>
  )
}

export function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardContentInner>{children}</DashboardContentInner>
    </SidebarProvider>
  )
}
