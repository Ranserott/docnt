/**
 * Sidebar de navegación principal
 * Diseño moderno y elegante con acceso a todos los módulos
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  Calendar,
  BookOpen,
  FileText,
  Settings,
  Home,
  GraduationCap,
  Files,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'
import { logoutAction } from '@/lib/actions/auth.actions'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Calendario',
    href: '/dashboard/calendar',
    icon: Calendar,
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Cursos',
    href: '/dashboard/courses',
    icon: BookOpen,
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Certámenes',
    href: '/dashboard/exams',
    icon: GraduationCap,
    color: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Archivos',
    href: '/dashboard/files',
    icon: Files,
    color: 'from-pink-500 to-pink-600',
  },
  {
    title: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
    color: 'from-slate-500 to-slate-600',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200/50 bg-white shadow-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-950',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Header del sidebar */}
      <div className="flex h-20 items-center justify-between border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-white px-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
                DOCNT
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gestión Docente
              </p>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
            <GraduationCap className="h-7 w-7" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navegación */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 ' + item.color + ' text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                {!collapsed && (
                  <span className="truncate">{item.title}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer del sidebar */}
      <div className="border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        {!collapsed && (
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 p-4 dark:from-slate-800 dark:to-slate-900">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
              <span className="text-lg font-bold">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                Usuario
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                Docente
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
              <span className="text-lg font-bold">U</span>
            </div>
          </div>
        )}
        {!collapsed && (
          <form action={logoutAction} className="mt-3">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-2 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
