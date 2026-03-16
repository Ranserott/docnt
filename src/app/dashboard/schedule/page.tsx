import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { SimpleScheduleView } from '@/components/schedule/simple-schedule-view'

export const metadata = {
  title: 'Horario Semanal | DOCNT',
}

export default async function SchedulePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Obtener cursos del usuario
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

  // Obtener eventos de la semana actual
  const now = new Date()
  const startOfWeek = new Date(now)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
  startOfWeek.setDate(diff)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const events = await prisma.scheduleEvent.findMany({
    where: {
      userId: session.user.id,
      OR: [
        {
          startDate: { gte: startOfWeek, lte: endOfWeek },
        },
        {
          endDate: { gte: startOfWeek, lte: endOfWeek },
        },
        {
          startDate: { lte: startOfWeek },
          endDate: { gte: endOfWeek },
        },
      ],
    },
    include: {
      course: true,
      section: true,
    },
    orderBy: { startDate: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Horario Semanal</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gestiona tu horario de clases y eventos
        </p>
      </div>

      <SimpleScheduleView
        initialEvents={events}
        courses={courses}
      />
    </div>
  )
}
