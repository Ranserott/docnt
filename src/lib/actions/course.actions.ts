/**
 * Server Actions para el módulo de Cursos y Secciones
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import {
  courseFormSchema,
  courseUpdateSchema,
  sectionFormSchema,
  sectionUpdateSchema,
  type CourseFormData,
  type SectionFormData,
} from '@/lib/validations'
import { auth } from '@/lib/auth'

// ==================== CURSOS ====================

/**
 * Obtiene todos los cursos del usuario
 */
export async function getCourses() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    const courses = await prisma.course.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            sections: true,
            events: true,
            exams: true,
          },
        },
      },
      orderBy: [
        { period: 'desc' },
        { name: 'asc' },
      ],
    })

    return { data: courses }
  } catch (error) {
    console.error('Error al obtener cursos:', error)
    return { error: 'Error al obtener cursos' }
  }
}

/**
 * Obtiene un curso por su ID
 */
export async function getCourseById(courseId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          orderBy: {
            name: 'asc',
          },
          include: {
            _count: {
              select: {
                events: true,
              },
            },
          },
        },
        events: {
          take: 5,
          orderBy: {
            startDate: 'desc',
          },
        },
        exams: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            sections: true,
            events: true,
            exams: true,
          },
        },
      },
    })

    // Verificar que el curso pertenece al usuario
    if (course?.userId !== session.user.id) {
      return { error: 'No tienes permiso para ver este curso' }
    }

    if (!course) {
      return { error: 'Curso no encontrado' }
    }

    return { data: course }
  } catch (error) {
    console.error('Error al obtener curso:', error)
    return { error: 'Error al obtener curso' }
  }
}

/**
 * Crea un nuevo curso
 */
export async function createCourse(data: CourseFormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Validar datos
  const validatedData = courseFormSchema.safeParse(data)

  if (!validatedData.success) {
    return { error: 'Datos inválidos', fieldErrors: validatedData.error.flatten().fieldErrors }
  }

  try {
    const course = await prisma.course.create({
      data: {
        ...validatedData.data,
        userId: session.user.id,
      },
    })

    revalidatePath('/courses')
    revalidatePath('/dashboard')

    return { data: course }
  } catch (error) {
    console.error('Error al crear curso:', error)
    return { error: 'Error al crear curso' }
  }
}

/**
 * Actualiza un curso existente
 */
export async function updateCourse(courseId: string, data: Partial<CourseFormData>) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Validar que el curso existe y pertenece al usuario
  const existingCourse = await prisma.course.findUnique({
    where: { id: courseId },
    select: { userId: true },
  })

  if (!existingCourse) {
    return { error: 'Curso no encontrado' }
  }

  if (existingCourse.userId !== session.user.id) {
    return { error: 'No tienes permiso para modificar este curso' }
  }

  // Validar datos
  const validatedData = courseUpdateSchema.safeParse({ id: courseId, ...data })

  if (!validatedData.success) {
    return { error: 'Datos inválidos', fieldErrors: validatedData.error.flatten().fieldErrors }
  }

  try {
    const { id, ...courseData } = validatedData.data

    const course = await prisma.course.update({
      where: { id: courseId },
      data: courseData,
    })

    revalidatePath('/courses')
    revalidatePath(`/courses/${courseId}`)

    return { data: course }
  } catch (error) {
    console.error('Error al actualizar curso:', error)
    return { error: 'Error al actualizar curso' }
  }
}

/**
 * Elimina un curso
 */
export async function deleteCourse(courseId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Validar que el curso existe y pertenece al usuario
  const existingCourse = await prisma.course.findUnique({
    where: { id: courseId },
    select: { userId: true },
  })

  if (!existingCourse) {
    return { error: 'Curso no encontrado' }
  }

  if (existingCourse.userId !== session.user.id) {
    return { error: 'No tienes permiso para eliminar este curso' }
  }

  try {
    await prisma.course.delete({
      where: { id: courseId },
    })

    revalidatePath('/courses')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar curso:', error)
    return { error: 'Error al eliminar curso' }
  }
}

// ==================== SECCIONES ====================

/**
 * Obtiene todas las secciones de un curso
 */
export async function getSectionsByCourse(courseId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el curso pertenece al usuario
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { userId: true },
    })

    if (!course || course.userId !== session.user.id) {
      return { error: 'No tienes permiso para ver las secciones de este curso' }
    }

    const sections = await prisma.section.findMany({
      where: {
        courseId,
      },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return { data: sections }
  } catch (error) {
    console.error('Error al obtener secciones:', error)
    return { error: 'Error al obtener secciones' }
  }
}

/**
 * Crea una nueva sección
 */
export async function createSection(data: SectionFormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Validar datos
  const validatedData = sectionFormSchema.safeParse(data)

  if (!validatedData.success) {
    return { error: 'Datos inválidos', fieldErrors: validatedData.error.flatten().fieldErrors }
  }

  try {
    // Verificar que el curso pertenece al usuario
    const course = await prisma.course.findUnique({
      where: { id: validatedData.data.courseId },
      select: { userId: true },
    })

    if (!course || course.userId !== session.user.id) {
      return { error: 'No tienes permiso para crear secciones en este curso' }
    }

    const section = await prisma.section.create({
      data: validatedData.data,
    })

    revalidatePath('/courses')
    revalidatePath(`/courses/${validatedData.data.courseId}`)

    return { data: section }
  } catch (error) {
    console.error('Error al crear sección:', error)
    return { error: 'Error al crear sección' }
  }
}

/**
 * Actualiza una sección existente
 */
export async function updateSection(sectionId: string, data: Partial<SectionFormData>) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Validar que la sección existe y pertenece a un curso del usuario
  const existingSection = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      course: {
        select: { userId: true },
      },
    },
  })

  if (!existingSection) {
    return { error: 'Sección no encontrada' }
  }

  if (existingSection.course.userId !== session.user.id) {
    return { error: 'No tienes permiso para modificar esta sección' }
  }

  // Validar datos
  const validatedData = sectionUpdateSchema.safeParse({ id: sectionId, ...data })

  if (!validatedData.success) {
    return { error: 'Datos inválidos', fieldErrors: validatedData.error.flatten().fieldErrors }
  }

  try {
    const { id, ...sectionData } = validatedData.data

    const section = await prisma.section.update({
      where: { id: sectionId },
      data: sectionData,
    })

    revalidatePath('/courses')
    revalidatePath(`/courses/${existingSection.courseId}`)

    return { data: section }
  } catch (error) {
    console.error('Error al actualizar sección:', error)
    return { error: 'Error al actualizar sección' }
  }
}

/**
 * Elimina una sección
 */
export async function deleteSection(sectionId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Validar que la sección existe y pertenece a un curso del usuario
  const existingSection = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      course: {
        select: { userId: true, id: true },
      },
    },
  })

  if (!existingSection) {
    return { error: 'Sección no encontrada' }
  }

  if (existingSection.course.userId !== session.user.id) {
    return { error: 'No tienes permiso para eliminar esta sección' }
  }

  try {
    await prisma.section.delete({
      where: { id: sectionId },
    })

    revalidatePath('/courses')
    revalidatePath(`/courses/${existingSection.courseId}`)

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar sección:', error)
    return { error: 'Error al eliminar sección' }
  }
}
