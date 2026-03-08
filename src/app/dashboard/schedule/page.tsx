/**
 * Página de Horario Semanal
 */

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { startOfWeek } from 'date-fns'
import { ScheduleView } from '@/components/schedule/schedule-view'
import { getWeeklyEvents } from '@/lib/actions/schedule.actions'
import { getCourses } from '@/lib/actions/course.actions'

export default async function SchedulePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Obtener eventos de la semana actual
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const eventsResult = await getWeeklyEvents(weekStart)

  // Obtener cursos
  const coursesResult = await getCourses()

  // Obtener cursos con secciones para el diálogo
  const coursesWithSections = await prisma.course.findMany({
    where: { userId: session.user.id },
    include: {
      sections: {
        where: { active: true },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Horario Semanal
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gestiona tu horario de clases recurrentes
        </p>
      </div>

      {/* Vista del horario */}
      <ScheduleView
        initialEvents={eventsResult.data || []}
        courses={coursesWithSections}
        initialDate={weekStart.getTime()}
      />
    </div>
  )
}
