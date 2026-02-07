/**
 * Página principal del Dashboard
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Calendar, GraduationCap, TrendingUp, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getCourses } from '@/lib/actions/course.actions'
import { getExams } from '@/lib/actions/exam.actions'
import { getEvents } from '@/lib/actions/calendar.actions'

export default function DashboardPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const [coursesResult, examsResult, eventsResult] = await Promise.all([
        getCourses(),
        getExams(),
        getEvents(),
      ])
      if (coursesResult.data) setCourses(coursesResult.data)
      if (examsResult.data) setExams(examsResult.data)
      if (eventsResult.data) setEvents(eventsResult.data)
      setLoading(false)
    }
    loadData()
  }, [])

  // Calcular eventos de esta semana
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const thisWeekEvents = events.filter(e => {
    const eventDate = new Date(e.startDate)
    return eventDate >= weekStart && eventDate <= weekEnd
  })

  // Calcular total de secciones
  const totalSections = courses.reduce((sum, course) => sum + (course._count?.sections || 0), 0)

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Bienvenido a tu sistema de gestión docente
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:border-slate-800 dark:from-blue-950/50 dark:to-blue-900/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Cursos Activos
            </CardTitle>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-900 dark:text-blue-100">
              {loading ? '...' : courses.length}
            </div>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              Cursos en este período
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-green-100/50 dark:border-slate-800 dark:from-green-950/50 dark:to-green-900/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-green-900 dark:text-green-100">
              Secciones
            </CardTitle>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30">
              <Calendar className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-900 dark:text-green-100">
              {loading ? '...' : totalSections}
            </div>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              Secciones activas
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:border-slate-800 dark:from-purple-950/50 dark:to-purple-900/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-purple-900 dark:text-purple-100">
              Certámenes
            </CardTitle>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30">
              <GraduationCap className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-900 dark:text-purple-100">
              {loading ? '...' : exams.length}
            </div>
            <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
              Evaluaciones creadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:border-slate-800 dark:from-orange-950/50 dark:to-orange-900/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-orange-900 dark:text-orange-100">
              Próximos Eventos
            </CardTitle>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-900 dark:text-orange-100">
              {loading ? '...' : thisWeekEvents.length}
            </div>
            <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
              Esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Escala de Notas de Referencia */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Escala de Notas de Referencia (Chile)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { note: '7.0', label: 'Excelente', color: 'bg-green-500', percent: '95-100%' },
              { note: '6.0-6.9', label: 'Muy Bueno', color: 'bg-blue-500', percent: '85-94%' },
              { note: '5.0-5.9', label: 'Bueno', color: 'bg-cyan-500', percent: '75-84%' },
              { note: '4.0-4.9', label: 'Suficiente', color: 'bg-yellow-500', percent: '60-74%' },
              { note: '3.0-3.9', label: 'Insuficiente', color: 'bg-orange-500', percent: '40-59%' },
              { note: '2.0-2.9', label: 'Deficiente', color: 'bg-red-500', percent: '20-39%' },
              { note: '1.0-1.9', label: 'Muy Deficiente', color: 'bg-red-700', percent: '0-19%' },
            ].map((scale) => (
              <div key={scale.note} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className={`w-full h-2 rounded-full ${scale.color} mb-2`}></div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{scale.note}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{scale.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">{scale.percent}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Crear Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Comienza organizando un nuevo curso
            </p>
            <Link href="/dashboard/courses">
              <Button className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
                Ir a Cursos
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Agregar Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Planifica una clase o evaluación
            </p>
            <Link href="/dashboard/calendar">
              <Button className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50">
                Ir a Calendario
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Crear Certamen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Genera una evaluación nueva
            </p>
            <Link href="/dashboard/exams">
              <Button className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50">
                Ir a Certámenes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Bienvenida */}
      <Card className="border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-slate-800 dark:from-blue-950/30 dark:to-purple-950/30">
        <CardHeader>
          <CardTitle className="text-2xl">¡Bienvenido a DOCNT!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700 dark:text-slate-300">
            Tu sistema de gestión docente personal está listo para usar.
            Comienza creando tu primer curso y empieza a organizar tu docencia de manera eficiente.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/courses">
              <Button className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50">
                Crear Curso
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="rounded-xl border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                Configurar Perfil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
