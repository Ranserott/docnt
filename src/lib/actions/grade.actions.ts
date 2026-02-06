/**
 * Server Actions para el módulo de Notas y Corrección
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'

/**
 * Obtiene las notas de un examen
 */
export async function getGrades(examId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    const grades = await prisma.grade.findMany({
      where: {
        examId,
        student: {
          active: true,
        },
      },
      include: {
        student: true,
      },
      orderBy: {
        student: {
          name: 'asc',
        },
      },
    })

    return { data: grades }
  } catch (error) {
    console.error('Error al obtener notas:', error)
    return { error: 'Error al obtener notas' }
  }
}

/**
 * Obtiene las notas de un curso (todos los exámenes)
 */
export async function getGradesByCourse(courseId: string) {
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
      return { error: 'No tienes permiso para ver las notas de este curso' }
    }

    const grades = await prisma.grade.findMany({
      where: {
        exam: {
          courseId,
        },
        student: {
          active: true,
        },
      },
      include: {
        student: true,
        exam: true,
      },
      orderBy: {
        exam: {
          date: 'desc',
        },
      },
    })

    return { data: grades }
  } catch (error) {
    console.error('Error al obtener notas:', error)
    return { error: 'Error al obtener notas' }
  }
}

/**
 * Crea o actualiza una nota
 */
export async function upsertGrade(data: {
  examId: string
  studentId: string
  score: number
  grade?: number
  status?: string
  answersUrl?: string
  answersData?: any
  feedback?: string
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el examen pertenece al usuario
    const exam = await prisma.exam.findUnique({
      where: { id: data.examId },
      select: { userId: true },
    })

    if (!exam || exam.userId !== session.user.id) {
      return { error: 'No tienes permiso para modificar notas de este examen' }
    }

    const grade = await prisma.grade.upsert({
      where: {
        examId_studentId: {
          examId: data.examId,
          studentId: data.studentId,
        },
      },
      create: {
        examId: data.examId,
        studentId: data.studentId,
        score: data.score,
        grade: data.grade,
        status: data.status || 'graded',
        answersUrl: data.answersUrl,
        answersData: data.answersData,
        feedback: data.feedback,
        correctedAt: new Date(),
      },
      update: {
        score: data.score,
        grade: data.grade,
        status: data.status || 'graded',
        answersUrl: data.answersUrl,
        answersData: data.answersData,
        feedback: data.feedback,
        correctedAt: new Date(),
      },
    })

    revalidatePath('/dashboard/grades')

    return { data: grade }
  } catch (error) {
    console.error('Error al guardar nota:', error)
    return { error: 'Error al guardar nota' }
  }
}

/**
 * Elimina una nota
 */
export async function deleteGrade(examId: string, studentId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el examen pertenece al usuario
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { userId: true },
    })

    if (!exam || exam.userId !== session.user.id) {
      return { error: 'No tienes permiso para eliminar esta nota' }
    }

    await prisma.grade.deleteMany({
      where: {
        examId,
        studentId,
      },
    })

    revalidatePath('/dashboard/grades')

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar nota:', error)
    return { error: 'Error al eliminar nota' }
  }
}

/**
 * Obtiene la pauta de corrección de un examen
 */
export async function getGradingRubric(examId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    const rubric = await prisma.gradingRubric.findUnique({
      where: { examId },
    })

    return { data: rubric }
  } catch (error) {
    console.error('Error al obtener pauta:', error)
    return { error: 'Error al obtener pauta' }
  }
}

/**
 * Crea o actualiza la pauta de corrección
 */
export async function upsertGradingRubric(data: {
  examId: string
  name: string
  rubric: Record<string, string>
  points?: Record<string, number>
  imageUrl?: string
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el examen pertenece al usuario
    const exam = await prisma.exam.findUnique({
      where: { id: data.examId },
      select: { userId: true },
    })

    if (!exam || exam.userId !== session.user.id) {
      return { error: 'No tienes permiso para modificar este examen' }
    }

    const rubric = await prisma.gradingRubric.upsert({
      where: { examId: data.examId },
      create: {
        examId: data.examId,
        userId: session.user.id,
        name: data.name,
        rubric: data.rubric as any,
        points: data.points as any,
        imageUrl: data.imageUrl,
      },
      update: {
        name: data.name,
        rubric: data.rubric as any,
        points: data.points as any,
        imageUrl: data.imageUrl,
      },
    })

    revalidatePath('/dashboard/grades')

    return { data: rubric }
  } catch (error) {
    console.error('Error al guardar pauta:', error)
    return { error: 'Error al guardar pauta' }
  }
}
