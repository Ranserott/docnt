/**
 * Server Actions para el módulo de Calendario
 * Estas acciones se ejecutan en el servidor y proporcionan mutaciones type-safe
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import {
  eventFormSchema,
  eventUpdateSchema,
  eventDeleteSchema,
  eventQuerySchema,
  type EventFormData,
  type EventUpdateData,
} from '@/lib/validations'
import { auth } from '@/lib/auth'

// ==================== ACCIONES PÚBLICAS (Queries) ====================

/**
 * Obtiene todos los eventos del usuario autenticado
 */
export async function getEvents(params?: {
  courseId?: string
  sectionId?: string
  startDate?: Date
  endDate?: Date
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        ...(params?.courseId && { courseId: params.courseId }),
        ...(params?.sectionId && { sectionId: params.sectionId }),
        ...(params?.startDate &&
          params?.endDate && {
            startDate: {
              gte: params.startDate,
            },
            endDate: {
              lte: params.endDate,
            },
          }),
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        files: {
          include: {
            file: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    })

    // Transformar los datos para incluir solo los tags necesarios
    const transformedEvents = events.map((event: typeof events[0]) => ({
      ...event,
      tags: event.tags.map((et: typeof event.tags[0]) => et.tag),
      files: event.files.map((ef: typeof event.files[0]) => ef.file),
    }))

    return { data: transformedEvents }
  } catch (error) {
    console.error('Error al obtener eventos:', error)
    return { error: 'Error al obtener eventos' }
  }
}

/**
 * Obtiene un evento por su ID
 */
export async function getEventById(eventId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        files: {
          include: {
            file: true,
          },
        },
      },
    })

    // Verificar que el evento pertenece al usuario
    if (event?.userId !== session.user.id) {
      return { error: 'No tienes permiso para ver este evento' }
    }

    if (!event) {
      return { error: 'Evento no encontrado' }
    }

    // Transformar los datos
    const transformedEvent = {
      ...event,
      tags: event.tags.map((et: typeof event.tags[0]) => et.tag),
      files: event.files.map((ef: typeof event.files[0]) => ef.file),
    }

    return { data: transformedEvent }
  } catch (error) {
    console.error('Error al obtener evento:', error)
    return { error: 'Error al obtener evento' }
  }
}

/**
 * Obtiene los próximos eventos (próximos 7 días)
 */
export async function getUpcomingEvents() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  const now = new Date()
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  try {
    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        startDate: {
          gte: now,
          lte: weekFromNow,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      take: 10,
    })

    return { data: events }
  } catch (error) {
    console.error('Error al obtener próximos eventos:', error)
    return { error: 'Error al obtener próximos eventos' }
  }
}

// ==================== MUTACIONES ====================

/**
 * Crea un nuevo evento
 */
export async function createEvent(data: EventFormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Validar datos
  const validatedData = eventFormSchema.safeParse(data)

  if (!validatedData.success) {
    return { error: 'Datos inválidos', fieldErrors: validatedData.error.flatten().fieldErrors }
  }

  try {
    const { tagIds, ...eventData } = validatedData.data

    // Crear el evento
    const event = await prisma.event.create({
      data: {
        ...eventData,
        userId: session.user.id,
        tags: tagIds && tagIds.length > 0
          ? {
              create: tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    revalidatePath('/calendar')
    revalidatePath('/dashboard')

    return { data: event }
  } catch (error) {
    console.error('Error al crear evento:', error)
    return { error: 'Error al crear evento' }
  }
}

/**
 * Actualiza un evento existente
 */
export async function updateEvent(eventId: string, data: Partial<EventUpdateData>) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Validar que el evento existe y pertenece al usuario
  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
    select: { userId: true },
  })

  if (!existingEvent) {
    return { error: 'Evento no encontrado' }
  }

  if (existingEvent.userId !== session.user.id) {
    return { error: 'No tienes permiso para modificar este evento' }
  }

  // Validar datos
  const validatedData = eventUpdateSchema.safeParse({ id: eventId, ...data })

  if (!validatedData.success) {
    return { error: 'Datos inválidos', fieldErrors: validatedData.error.flatten().fieldErrors }
  }

  try {
    const { id, tagIds, ...eventData } = validatedData.data

    // Actualizar el evento
    const event = await prisma.event.update({
      where: { id: eventId },
      data: eventData,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    // Actualizar tags si se proporcionaron
    if (tagIds !== undefined) {
      // Eliminar tags existentes
      await prisma.eventTag.deleteMany({
        where: { eventId },
      })

      // Agregar nuevos tags
      if (tagIds.length > 0) {
        await prisma.eventTag.createMany({
          data: tagIds.map((tagId) => ({
            eventId,
            tagId,
          })),
        })
      }
    }

    revalidatePath('/calendar')
    revalidatePath('/dashboard')

    return { data: event }
  } catch (error) {
    console.error('Error al actualizar evento:', error)
    return { error: 'Error al actualizar evento' }
  }
}

/**
 * Elimina un evento
 */
export async function deleteEvent(eventId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Validar que el evento existe y pertenece al usuario
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

  try {
    await prisma.event.delete({
      where: { id: eventId },
    })

    revalidatePath('/calendar')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar evento:', error)
    return { error: 'Error al eliminar evento' }
  }
}

/**
 * Agrega una etiqueta a un evento
 */
export async function addTagToEvent(eventId: string, tagId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el evento pertenece al usuario
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true },
    })

    if (!event || event.userId !== session.user.id) {
      return { error: 'No tienes permiso para modificar este evento' }
    }

    await prisma.eventTag.create({
      data: {
        eventId,
        tagId,
      },
    })

    revalidatePath('/calendar')

    return { success: true }
  } catch (error) {
    console.error('Error al agregar etiqueta:', error)
    return { error: 'Error al agregar etiqueta' }
  }
}

/**
 * Elimina una etiqueta de un evento
 */
export async function removeTagFromEvent(eventId: string, tagId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el evento pertenece al usuario
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true },
    })

    if (!event || event.userId !== session.user.id) {
      return { error: 'No tienes permiso para modificar este evento' }
    }

    await prisma.eventTag.deleteMany({
      where: {
        eventId,
        tagId,
      },
    })

    revalidatePath('/calendar')

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar etiqueta:', error)
    return { error: 'Error al eliminar etiqueta' }
  }
}

/**
 * Obtiene todas las etiquetas del usuario
 */
export async function getTags() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return { data: tags }
  } catch (error) {
    console.error('Error al obtener etiquetas:', error)
    return { error: 'Error al obtener etiquetas' }
  }
}

/**
 * Crea una nueva etiqueta
 */
export async function createTag(name: string, color?: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    const tag = await prisma.tag.create({
      data: {
        name,
        color,
      },
    })

    revalidatePath('/calendar')

    return { data: tag }
  } catch (error) {
    console.error('Error al crear etiqueta:', error)
    return { error: 'Error al crear etiqueta' }
  }
}
