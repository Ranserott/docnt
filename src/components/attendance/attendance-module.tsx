'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ExternalLink,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  BookOpen,
  Link as LinkIcon,
  Maximize2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

interface AttendanceLink {
  id: string
  title: string
  url: string
  description: string
  icon: React.ReactNode
  badge?: string
  external: boolean
}

const quickLinks: AttendanceLink[] = [
  {
    id: 'attendance',
    title: 'Mi Asistencia UST',
    url: 'https://miasistencia.santotomas.cl/',
    description: 'Portal oficial de asistencia',
    icon: <Users className="h-5 w-5" />,
    badge: 'Oficial',
    external: true,
  },
  {
    id: 'portal',
    title: 'Portal Docente',
    url: 'https://www.santotomas.cl/',
    description: 'Portal institucional UST',
    icon: <BookOpen className="h-5 w-5" />,
    external: true,
  },
]

const recentActivity = [
  {
    id: 1,
    course: 'Programación Web',
    date: '2024-03-15',
    time: '08:30',
    status: 'present',
    students: 28,
  },
  {
    id: 2,
    course: 'Base de Datos',
    date: '2024-03-14',
    time: '10:15',
    status: 'partial',
    students: 25,
  },
  {
    id: 3,
    course: 'Algoritmos',
    date: '2024-03-13',
    time: '14:00',
    status: 'absent',
    students: 0,
  },
]

export function AttendanceModule() {
  const [showIframe, setShowIframe] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  const handleIframeError = () => {
    setIframeError(true)
    setShowIframe(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Módulo de Asistencia
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gestiona la asistencia de tus cursos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Conectado a UST
          </Badge>
        </div>
      </div>

      {/* Acceso Principal */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <CardContent className="relative p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                </div>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                  Portal UST
                </Badge>
              </div>
              <h2 className="text-3xl font-bold">Mi Asistencia</h2>
              <p className="text-blue-100 max-w-lg text-lg">
                Accede al portal institucional para registrar la asistencia de tus cursos. 
                Se abrirá en una nueva pestaña para tu seguridad.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <a
                href="https://miasistencia.santotomas.cl/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <ExternalLink className="h-5 w-5" />
                Acceder al Portal
                <ChevronRight className="h-5 w-5" />
              </a>
              
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => setShowIframe(!showIframe)}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                {showIframe ? 'Cerrar vista integrada' : 'Probar vista integrada'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Iframe (opcional, puede no funcionar por X-Frame-Options) */}
      {showIframe && (
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-blue-500" />
                Vista Integrada
              </CardTitle>
              <CardDescription>
                Si la página no carga, usa el botón "Acceder al Portal" arriba
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIframe(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {iframeError ? (
              <div className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se puede mostrar en iframe</h3>
                <p className="text-slate-500 mb-4">
                  El portal de asistencia tiene protección de seguridad. 
                  Usa el botón "Acceder al Portal" arriba.
                </p>
                <Button asChild>
                  <a
                    href="https://miasistencia.santotomas.cl/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir en nueva pestaña
                  </a>
                </Button>
              </div>
            ) : (
              <iframe
                src="https://miasistencia.santotomas.cl/"
                className="w-full h-[600px] border-0"
                onError={handleIframeError}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title="Portal de Asistencia UST"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Grid de enlaces rápidos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-slate-950"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
            
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  {link.icon}
                </div>
                {link.badge && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {link.badge}
                  </Badge>
                )}
              </div>
              
              <h3 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
                {link.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {link.description}
              </p>
              
              {link.external && (
                <div className="mt-3 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                  <ExternalLink className="mr-1 h-4 w-4" />
                  Abrir en nueva pestaña
                </div>
              )}
            </div>
          </a>
        ))}
      </div>

      {/* Historial de actividad */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Últimos registros de asistencia
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Ver todo
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center',
                    activity.status === 'present' && 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
                    activity.status === 'partial' && 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
                    activity.status === 'absent' && 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                  )}>
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {activity.course}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {activity.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={
                    activity.status === 'present' ? 'default' :
                    activity.status === 'partial' ? 'secondary' : 'destructive'
                  }>
                    {activity.status === 'present' ? `${activity.students} estudiantes` :
                     activity.status === 'partial' ? 'Parcial' : 'Sin registro'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <AlertCircle className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">¿Necesitas ayuda con el portal de asistencia?</h3>
              <p className="text-slate-300 text-sm mb-4">
                Si tienes problemas para acceder o registrar la asistencia en el portal institucional, 
                contacta a soporte técnico de la universidad o revisa la documentación oficial.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" asChild>
                  <a href="https://www.santotomas.cl/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Portal UST
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
                  <Link href="/dashboard/settings">
                    Configuración
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// X icon already imported above
