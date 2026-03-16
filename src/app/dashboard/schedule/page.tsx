/**
 * Página de Horario Semanal - Nueva Implementación
 */

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { WeeklySchedule } from '@/components/schedule/weekly-schedule'
import { startOfWeek, endOfWeek } from 'date-fns'

export const metadata = {
  title: 'Horario Semanal | DOCNT',
  description: 'Gestiona tu horario de clases y eventos semanales',
}

export default async function SchedulePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Obtener cursos con secciones
  const courses = await prisma.course.findMany({
    where: { userId: session.user.id },
    include: {
      sections: {
        where: { active: true },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Calcular rango de la semana actual
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  // Obtener eventos recurrentes (horario semanal) y eventos de la semana
  const events = await prisma.event.findMany({
    where: {
      userId: session.user.id,
      OR: [
        // Eventos dentro de la semana actual
        {
          AND: [
            { startDate: { gte: weekStart } },
            { startDate: { lte: weekEnd } },
          ],
        },
        // Eventos recurrentes (horario semanal)
        {
          isRecurring: true,
          OR: [
            { recurrenceEnd: null },
            { recurrenceEnd: { gte: weekStart } },
          ],
        },
      ],
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          code: true,
          color: true,
        },
      },
      section: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { startDate: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Horario Semanal
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Gestiona tu horario de clases y eventos
        </p>
      </div>

      <WeeklySchedule
        initialEvents={events}
        courses={courses}
      />
    </div>
  )
}
