/**
 * Layout del Dashboard
 * Incluye sidebar y header para todas las páginas del dashboard
 */

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardContent } from './dashboard-content'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <DashboardContent>{children}</DashboardContent>
}
