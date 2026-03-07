/**
 * Server Actions para el módulo de Horario Semanal
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { startOfWeek, endOfWeek, addWeeks, subWeeks, startOfDay, endOfDay } from 'date-fns'

/**
 * Obtiene eventos de una semana específica
 */
export async function getWeeklyEvents(weekStart: Date) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Calcular rango de la semana
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        OR: [
          // Eventos dentro de la semana
          {
            startDate: {
              gte: startOfDay(weekStart),
              lte: endOfDay(weekEnd),
            },
          },
          // Eventos recurrentes (no tienen fin de recurrencia o la recurrencia continúa)
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
      orderBy: {
        startDate: 'asc',
      },
    })

    // Filtrar eventos recurrentes y expandirlos para la semana actual
    const expandedEvents = events.flatMap((event) => {
      if (!event.isRecurring) {
        return [event]
      }

      // Para eventos recurrentes, generar instancias para la semana actual
      const instances = []
      const eventDayOfWeek = event.startDate.getDay() // 0 = Domingo, 1 = Lunes, etc.

      // Calcular cuántas semanas de diferencia hay entre la fecha original y la semana actual
      const weeksDiff = Math.floor(
        (weekStart.getTime() - event.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      )

      // Si la recurrencia ya terminó, no incluir
      if (event.recurrenceEnd && event.recurrenceEnd < weekStart) {
        return []
      }

      // Generar el evento para la semana actual
      const weekStartDate = new Date(event.startDate)
      weekStartDate.setDate(weekStartDate.getDate() + (weeksDiff >= 0 ? weeksDiff * 7 : 0))

      // Ajustar al día de la semana correcto dentro de la semana actual
      const targetDate = new Date(weekStart)
      targetDate.setDate(targetDate.getDate() + (eventDayOfWeek - targetDate.getDay()))

      // Crear una nueva fecha con la hora del evento
      const instanceDate = new Date(targetDate)
      instanceDate.setHours(
        event.startDate.getHours(),
        event.startDate.getMinutes(),
        event.startDate.getSeconds()
      )

      // Calcular endDate
      let instanceEndDate: Date | null = null
      if (event.endDate) {
        instanceEndDate = new Date(instanceDate)
        const duration = event.endDate.getTime() - event.startDate.getTime()
        instanceEndDate.setTime(instanceEndDate.getTime() + duration)
      }

      instances.push({
        ...event,
        startDate: instanceDate,
        endDate: instanceEndDate,
      })

      return instances
    })

    return { data: expandedEvents }
  } catch (error) {
    console.error('Error al obtener eventos semanales:', error)
    return { error: 'Error al obtener eventos' }
  }
}

/**
 * Crea un nuevo bloque de horario
 */
export async function createScheduleBlock(data: {
  title: string
  description?: string
  type: string
  courseId?: string
  sectionId?: string
  location?: string
  dayOfWeek: number // 0 = Domingo, 1 = Lunes, etc.
  startHour: number // 7-22
  startMinute: number // 0-59
  duration: number // en minutos
  isRecurring: boolean
  recurrenceEnd?: Date
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el curso pertenece al usuario si se proporciona
    if (data.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: data.courseId },
        select: { userId: true },
      })

      if (!course || course.userId !== session.user.id) {
        return { error: 'No tienes permiso para crear eventos en este curso' }
      }
    }

    // Calcular la fecha del evento (primer lunes a las 7:00 como referencia)
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - baseDate.getDay() + data.dayOfWeek)
    baseDate.setHours(data.startHour, data.startMinute, 0, 0)

    const endDate = new Date(baseDate)
    endDate.setMinutes(endDate.getMinutes() + data.duration)

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type as any,
        location: data.location,
        startDate: baseDate,
        endDate: endDate,
        allDay: false,
        isRecurring: data.isRecurring,
        recurrencePattern: data.isRecurring ? 'weekly' : null,
        recurrenceEnd: data.isRecurring ? data.recurrenceEnd || null : null,
        userId: session.user.id,
        courseId: data.courseId,
        sectionId: data.sectionId,
      },
      include: {
        course: true,
        section: true,
      },
    })

    revalidatePath('/dashboard/schedule')
    revalidatePath('/dashboard/calendar')

    return { data: event }
  } catch (error) {
    console.error('Error al crear bloque de horario:', error)
    return { error: 'Error al crear bloque de horario' }
  }
}

/**
 * Actualiza un bloque de horario existente
 */
export async function updateScheduleBlock(
  eventId: string,
  data: {
    title?: string
    description?: string
    type?: string
    courseId?: string
    sectionId?: string
    location?: string
    dayOfWeek?: number
    startHour?: number
    startMinute?: number
    duration?: number
    isRecurring?: boolean
    recurrenceEnd?: Date
  }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el evento pertenece al usuario
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true, startDate: true },
    })

    if (!existingEvent) {
      return { error: 'Evento no encontrado' }
    }

    if (existingEvent.userId !== session.user.id) {
      return { error: 'No tienes permiso para modificar este evento' }
    }

    // Calcular nuevas fechas si se proporcionaron datos de horario
    let updateData: any = { ...data }
    delete updateData.dayOfWeek
    delete updateData.startHour
    delete updateData.startMinute
    delete updateData.duration

    if (data.dayOfWeek !== undefined || data.startHour !== undefined || data.startMinute !== undefined) {
      const newDate = new Date(existingEvent.startDate)
      if (data.dayOfWeek !== undefined) {
        const currentDay = newDate.getDay()
        const dayDiff = data.dayOfWeek - currentDay
        newDate.setDate(newDate.getDate() + dayDiff)
      }
      if (data.startHour !== undefined) {
        newDate.setHours(data.startHour)
      }
      if (data.startMinute !== undefined) {
        newDate.setMinutes(data.startMinute)
      }
      newDate.setSeconds(0, 0)

      updateData.startDate = newDate

      if (data.duration !== undefined) {
        const newEndDate = new Date(newDate)
        newEndDate.setMinutes(newEndDate.getMinutes() + data.duration)
        updateData.endDate = newEndDate
      }
    }

    if (data.isRecurring !== undefined) {
      updateData.recurrencePattern = data.isRecurring ? 'weekly' : null
      if (!data.isRecurring) {
        updateData.recurrenceEnd = null
      }
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        course: true,
        section: true,
      },
    })

    revalidatePath('/dashboard/schedule')
    revalidatePath('/dashboard/calendar')

    return { data: event }
  } catch (error) {
    console.error('Error al actualizar bloque de horario:', error)
    return { error: 'Error al actualizar bloque de horario' }
  }
}

/**
 * Elimina un bloque de horario
 */
export async function deleteScheduleBlock(eventId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el evento pertenece al usuario
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true },
    })

    if (!existingEvent) {
      return { error: 'Evento no encontrado' }
    }

    if (existingEvent.userId !== session.user.id) {
      return { error: 'No tienes permiso para eliminar este evento' }
    }

    await prisma.event.delete({
      where: { id: eventId },
    })

    revalidatePath('/dashboard/schedule')
    revalidatePath('/dashboard/calendar')

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar bloque de horario:', error)
    return { error: 'Error al eliminar bloque de horario' }
  }
}
