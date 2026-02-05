/**
 * Header principal del dashboard
 */

'use client'

import { Bell, Search, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Header() {
  return (
    <header className="fixed left-72 right-0 top-0 z-40 flex h-20 items-center gap-4 border-b border-slate-200/50 bg-white/80 px-6 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      {/* Búsqueda */}
      <div className="flex-1">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Buscar cursos, eventos, archivos..."
            className="h-12 w-full rounded-xl border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        {/* Notificaciones */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
          </span>
        </Button>

        {/* Menú de usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src="/avatar.png" alt="Usuario" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 dark:border-slate-700">
            <DropdownMenuLabel className="text-base font-semibold">Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg text-red-600 focus:text-red-600 dark:text-red-400">
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
