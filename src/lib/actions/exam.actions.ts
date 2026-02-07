/**
 * Server Actions para el módulo de Certámenes
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'

/**
 * Obtiene todos los certámenes del usuario
 */
export async function getExams() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    const exams = await prisma.exam.findMany({
      where: {
        userId: session.user.id,
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
        questions: {
          include: {
            question: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { data: exams }
  } catch (error) {
    console.error('Error al obtener certámenes:', error)
    return { error: 'Error al obtener certámenes' }
  }
}

/**
 * Obtiene un certamen por su ID
 */
export async function getExamById(examId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        course: true,
        questions: {
          include: {
            question: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    // Verificar que el certamen pertenece al usuario
    if (exam?.userId !== session.user.id) {
      return { error: 'No tienes permiso para ver este certamen' }
    }

    if (!exam) {
      return { error: 'Certamen no encontrado' }
    }

    return { data: exam }
  } catch (error) {
    console.error('Error al obtener certamen:', error)
    return { error: 'Error al obtener certamen' }
  }
}

/**
 * Crea un nuevo certamen
 */
export async function createExam(data: {
  title: string
  description?: string
  date?: Date
  duration?: number
  courseId: string
  allowRandom?: boolean
  showResults?: boolean
  fileUrl?: string
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
      return { error: 'No tienes permiso para crear certámenes en este curso' }
    }

    // Crear el certamen
    const exam = await prisma.exam.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        duration: data.duration,
        allowRandom: data.allowRandom ?? false,
        showResults: data.showResults ?? false,
        fileUrl: data.fileUrl,
        totalPoints: 0,
        userId: session.user.id,
        courseId: data.courseId,
      },
    })

    // Si tiene fecha, crear automáticamente un evento en el calendario
    if (data.date) {
      // Crear evento para todo el día
      const startDate = new Date(data.date)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(data.date)
      endDate.setHours(23, 59, 59, 999)

      await prisma.event.create({
        data: {
          title: `📝 ${data.title}`,
          description: data.description ? `Certamen: ${data.description}` : `Certamen de ${course.userId ? 'curso' : 'evaluación'}`,
          type: 'EVALUACION',
          startDate,
          endDate,
          allDay: true,
          status: 'scheduled',
          userId: session.user.id,
          courseId: data.courseId,
        },
      })

      revalidatePath('/dashboard/calendar')
    }

    revalidatePath('/dashboard/exams')
    revalidatePath('/dashboard')

    return { data: exam }
  } catch (error) {
    console.error('Error al crear certamen:', error)
    return { error: 'Error al crear certamen' }
  }
}

/**
 * Actualiza un certamen existente
 */
export async function updateExam(examId: string, data: {
  title?: string
  description?: string
  date?: Date
  duration?: number
  allowRandom?: boolean
  showResults?: boolean
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Validar que el certamen existe y pertenece al usuario
  const existingExam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { userId: true },
  })

  if (!existingExam) {
    return { error: 'Certamen no encontrado' }
  }

  if (existingExam.userId !== session.user.id) {
    return { error: 'No tienes permiso para modificar este certamen' }
  }

  try {
    const exam = await prisma.exam.update({
      where: { id: examId },
      data,
    })

    revalidatePath('/dashboard/exams')

    return { data: exam }
  } catch (error) {
    console.error('Error al actualizar certamen:', error)
    return { error: 'Error al actualizar certamen' }
  }
}

/**
 * Elimina un certamen
 */
export async function deleteExam(examId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  // Validar que el certamen existe y pertenece al usuario
  const existingExam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { userId: true },
  })

  if (!existingExam) {
    return { error: 'Certamen no encontrado' }
  }

  if (existingExam.userId !== session.user.id) {
    return { error: 'No tienes permiso para eliminar este certamen' }
  }

  try {
    await prisma.exam.delete({
      where: { id: examId },
    })

    revalidatePath('/dashboard/exams')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar certamen:', error)
    return { error: 'Error al eliminar certamen' }
  }
}

/**
 * Obtiene todas las preguntas del usuario
 */
export async function getQuestions() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    const questions = await prisma.question.findMany({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { data: questions }
  } catch (error) {
    console.error('Error al obtener preguntas:', error)
    return { error: 'Error al obtener preguntas' }
  }
}

/**
 * Crea una nueva pregunta
 */
export async function createQuestion(data: {
  content: string
  type: string
  difficulty: string
  unit?: string
  points: number
  options?: string[]
  correctAnswer?: string
  tags?: string[]
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    const question = await prisma.question.create({
      data: {
        content: data.content,
        type: data.type as any,
        difficulty: data.difficulty as any,
        unit: data.unit,
        points: data.points,
        options: data.options as any,
        correctAnswer: data.correctAnswer,
        tags: data.tags || [],
      },
    })

    revalidatePath('/dashboard/exams')

    return { data: question }
  } catch (error) {
    console.error('Error al crear pregunta:', error)
    return { error: 'Error al crear pregunta' }
  }
}

/**
 * Agrega una pregunta a un certamen
 */
export async function addQuestionToExam(examId: string, questionId: string, order: number, points?: number) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el certamen pertenece al usuario
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { userId: true },
    })

    if (!exam || exam.userId !== session.user.id) {
      return { error: 'No tienes permiso para modificar este certamen' }
    }

    // Crear relación
    await prisma.examQuestion.create({
      data: {
        examId,
        questionId,
        order,
        points: points ?? 1,
      },
    })

    // Recalcular total de puntos
    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId },
    })

    const totalPoints = examQuestions.reduce((sum, eq) => sum + (eq.points || 0), 0)

    await prisma.exam.update({
      where: { id: examId },
      data: { totalPoints },
    })

    revalidatePath('/dashboard/exams')

    return { success: true }
  } catch (error) {
    console.error('Error al agregar pregunta al certamen:', error)
    return { error: 'Error al agregar pregunta' }
  }
}

/**
 * Elimina una pregunta de un certamen
 */

/**
 * Sube un archivo PDF y lo asocia a un certamen
 */
export async function uploadExamFile(data: {
  name: string
  url: string
  size: number
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
      return { error: 'No tienes permiso para subir archivos a este curso' }
    }

    const file = await prisma.file.create({
      data: {
        name: data.name,
        filename: data.name,
        mimeType: 'application/pdf',
        size: data.size,
        url: data.url,
        userId: session.user.id,
        courseId: data.courseId,
        version: 1,
      },
    })

    revalidatePath('/dashboard/exams')

    return { data: file }
  } catch (error) {
    console.error('Error al subir archivo:', error)
    return { error: 'Error al subir archivo' }
  }
}
export async function removeQuestionFromExam(examId: string, questionId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  try {
    // Verificar que el certamen pertenece al usuario
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { userId: true },
    })

    if (!exam || exam.userId !== session.user.id) {
      return { error: 'No tienes permiso para modificar este certamen' }
    }

    await prisma.examQuestion.deleteMany({
      where: {
        examId,
        questionId,
      },
    })

    // Recalcular total de puntos
    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId },
    })

    const totalPoints = examQuestions.reduce((sum, eq) => sum + (eq.points || 0), 0)

    await prisma.exam.update({
      where: { id: examId },
      data: { totalPoints },
    })

    revalidatePath('/dashboard/exams')

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar pregunta del certamen:', error)
    return { error: 'Error al eliminar pregunta' }
  }
}
