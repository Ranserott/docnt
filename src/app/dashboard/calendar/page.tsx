/**
 * Página de Calendario
 * Vista completa con gestión de eventos
 */

import { CalendarView } from '@/components/calendar/calendar-view'
import { getEvents } from '@/lib/actions/calendar.actions'
import { getCourses } from '@/lib/actions/course.actions'

export default async function CalendarPage() {
  // Obtener eventos y cursos en el servidor
  const eventsResult = await getEvents()
  const coursesResult = await getCourses()

  const events = eventsResult.data || []
  const courses = coursesResult.data || []

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Calendario
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Planifica y organiza tus clases y eventos
          </p>
        </div>
      </div>

      {/* Vista del calendario */}
      <CalendarView initialEvents={events} courses={courses} />
    </div>
  )
}
