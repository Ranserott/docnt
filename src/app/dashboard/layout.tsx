/**
 * Layout del Dashboard
 * Incluye sidebar y header para todas las páginas del dashboard
 */

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <>
      {/* Sidebar fija */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="ml-72 flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
        <Header />
        <main className="flex-1 p-6 pt-20">
          {children}
        </main>
      </div>
    </>
  )
}
