/**
 * Validaciones Zod para Exámenes y Preguntas
 */

import { z } from 'zod'
import { QuestionType, Difficulty } from '@prisma/client'

export const questionFormSchema = z.object({
  content: z.string().min(1, 'El contenido es requerido').max(5000, 'Máximo 5000 caracteres'),
  type: z.nativeEnum(QuestionType),
  difficulty: z.nativeEnum(Difficulty),
  unit: z.string().max(100, 'Máximo 100 caracteres').optional(),
  points: z.number().int().min(0, 'Puntaje mínimo 0').default(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  tags: z.array(z.string()).default([]),
  active: z.boolean().default(true),
})

export const questionUpdateSchema = questionFormSchema.partial().extend({
  id: z.string().cuid(),
})

export const questionDeleteSchema = z.object({
  id: z.string().cuid(),
})

export const examFormSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),
  description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  date: z.date().optional(),
  duration: z.number().int().positive('Duración debe ser positivo').optional(),
  allowRandom: z.boolean().default(false),
  showResults: z.boolean().default(false),
  courseId: z.string().min(1, 'El curso es requerido').cuid(),
  questions: z.array(z.object({
    questionId: z.string().min(1, 'La pregunta es requerida').cuid(),
    points: z.number().int().min(0, 'Puntaje mínimo 0'),
  })).min(1, 'Debe agregar al menos una pregunta'),
})

export const examUpdateSchema = examFormSchema.partial().extend({
  id: z.string().cuid(),
})

export const examDeleteSchema = z.object({
  id: z.string().cuid(),
})

export const examQuerySchema = z.object({
  courseId: z.string().cuid().optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  type: z.nativeEnum(QuestionType).optional(),
  unit: z.string().optional(),
})

export type QuestionFormData = z.infer<typeof questionFormSchema>
export type QuestionUpdateData = z.infer<typeof questionUpdateSchema>
export type ExamFormData = z.infer<typeof examFormSchema>
export type ExamUpdateData = z.infer<typeof examUpdateSchema>
export type ExamQueryParams = z.infer<typeof examQuerySchema>
