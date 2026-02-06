/**
 * Server Actions para el módulo de Alumnos
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'

/**
 * Obtiene todos los alumnos de un curso
 */
export async function getStudents(courseId: string) {
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
      return { error: 'No tienes permiso para ver los alumnos de este curso' }
    }

    const students = await prisma.student.findMany({
      where: {
        courseId,
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return { data: students }
  } catch (error) {
    console.error('Error al obtener alumnos:', error)
    return { error: 'Error al obtener alumnos' }
  }
}

/**
 * Obtiene un alumno por su ID
 */
export async function getStudentById(studentId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        course: true,
        grades: {
          include: {
            exam: true,
          },
        },
      },
    })

    if (!student || student.userId !== session.user.id) {
      return { error: 'Alumno no encontrado' }
    }

    return { data: student }
  } catch (error) {
    console.error('Error al obtener alumno:', error)
    return { error: 'Error al obtener alumno' }
  }
}

/**
 * Crea un nuevo alumno
 */
export async function createStudent(data: {
  name: string
  email?: string
  studentCode?: string
  courseId: string
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el curso pertenece al usuario
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      select: { userId: true },
    })

    if (!course || course.userId !== session.user.id) {
      return { error: 'No tienes permiso para agregar alumnos a este curso' }
    }

    const student = await prisma.student.create({
      data: {
        name: data.name,
        email: data.email,
        studentCode: data.studentCode,
        userId: session.user.id,
        courseId: data.courseId,
      },
    })

    revalidatePath('/dashboard/grades')
    revalidatePath('/dashboard')

    return { data: student }
  } catch (error) {
    console.error('Error al crear alumno:', error)
    return { error: 'Error al crear alumno' }
  }
}

/**
 * Actualiza un alumno
 */
export async function updateStudent(studentId: string, data: {
  name?: string
  email?: string
  studentCode?: string
  active?: boolean
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el alumno pertenece a un curso del usuario
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        course: {
          select: { userId: true },
        },
      },
    })

    if (!existingStudent || existingStudent.course.userId !== session.user.id) {
      return { error: 'No tienes permiso para modificar este alumno' }
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data,
    })

    revalidatePath('/dashboard/grades')

    return { data: student }
  } catch (error) {
    console.error('Error al actualizar alumno:', error)
    return { error: 'Error al actualizar alumno' }
  }
}

/**
 * Elimina un alumno (soft delete)
 */
export async function deleteStudent(studentId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el alumno pertenece a un curso del usuario
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        course: {
          select: { userId: true },
        },
      },
    })

    if (!existingStudent || existingStudent.course.userId !== session.user.id) {
      return { error: 'No tienes permiso para eliminar este alumno' }
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { active: false },
    })

    revalidatePath('/dashboard/grades')

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar alumno:', error)
    return { error: 'Error al eliminar alumno' }
  }
}
