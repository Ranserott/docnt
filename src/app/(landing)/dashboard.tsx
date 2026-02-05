/**
 * Página principal del Dashboard
 * Muestra estadísticas y resumen de actividades
 */

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Calendar, FileText, GraduationCap } from 'lucide-react'
import { getUpcomingEvents, getCourses } from '@/lib/actions'
import { auth } from '@/lib/auth'

async function DashboardStats() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return null
  }

  const [coursesResult, eventsResult] = await Promise.all([
    getCourses(),
    getUpcomingEvents(),
  ])

  const courses = coursesResult.data || []
  const upcomingEvents = eventsResult.data || []

  // Calcular estadísticas
  const totalCourses = courses.length
  const totalSections = courses.reduce((acc: number, course: typeof courses[0]) => acc + course._count.sections, 0)
  const totalExams = courses.reduce((acc: number, course: typeof courses[0]) => acc + course._count.exams, 0)
  const upcomingEventsCount = upcomingEvents.length

  const stats = [
    {
      title: 'Cursos Activos',
      value: totalCourses,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Secciones',
      value: totalSections,
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Certámenes',
      value: totalExams,
      icon: GraduationCap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Próximos Eventos',
      value: upcomingEventsCount,
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

async function UpcomingEvents() {
  const eventsResult = await getUpcomingEvents()

  if (!eventsResult.data || eventsResult.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay próximos eventos.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {eventsResult.data.map((event: NonNullable<typeof eventsResult.data>[number]) => (
            <div
              key={event.id}
              className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 px-3 py-2">
                <span className="text-xs font-medium text-primary">
                  {new Date(event.startDate).toLocaleDateString('es-CL', { day: 'numeric' })}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.startDate).toLocaleDateString('es-CL', { month: 'short' })}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{event.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {event.course?.name && `· ${event.course.name}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.startDate).toLocaleTimeString('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex gap-1">
                <span
                  className="rounded-full px-2 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: event.course?.color || '#3b82f6',
                    color: 'white',
                  }}
                >
                  {event.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function RecentCourses() {
  const coursesResult = await getCourses()

  if (!coursesResult.data || coursesResult.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cursos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay cursos creados aún.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cursos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {coursesResult.data.slice(0, 5).map((course: NonNullable<typeof coursesResult.data>[number]) => (
            <div
              key={course.id}
              className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: course.color || '#3b82f6' }}
              >
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{course.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {course.code && `${course.code} · `}Periodo {course.period}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{course._count.sections} secciones</p>
                <p>{course._count.events} eventos</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido a tu sistema de gestión docente
        </p>
      </div>

      {/* Estadísticas */}
      <Suspense fallback={<div>Cargando estadísticas...</div>}>
        <DashboardStats />
      </Suspense>

      {/* Grid de contenido */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Cargando eventos...</div>}>
          <UpcomingEvents />
        </Suspense>
        <Suspense fallback={<div>Cargando cursos...</div>}>
          <RecentCourses />
        </Suspense>
      </div>
    </div>
  )
}
