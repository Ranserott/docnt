/**
 * Validaciones Zod para Cursos y Secciones
 */

import { z } from 'zod'

export const courseFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'Máximo 200 caracteres'),
  code: z.string().max(50, 'Máximo 50 caracteres').optional(),
  period: z.string().min(1, 'El periodo es requerido').max(50, 'Máximo 50 caracteres'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color debe ser hex formato #RRGGBB').optional(),
  description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
})

export const courseUpdateSchema = courseFormSchema.partial().extend({
  id: z.string().cuid(),
})

export const courseDeleteSchema = z.object({
  id: z.string().cuid(),
})

export const sectionFormSchema = z.object({
  courseId: z.string().min(1, 'El curso es requerido').cuid(),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  room: z.string().max(50, 'Máximo 50 caracteres').optional(),
  schedule: z.array(z.object({
    day: z.string(),
    start: z.string(),
    end: z.string(),
  })).optional(),
  active: z.boolean().default(true),
})

export const sectionUpdateSchema = sectionFormSchema.partial().extend({
  id: z.string().cuid(),
})

export const sectionDeleteSchema = z.object({
  id: z.string().cuid(),
})

export type CourseFormData = z.infer<typeof courseFormSchema>
export type CourseUpdateData = z.infer<typeof courseUpdateSchema>
export type SectionFormData = z.infer<typeof sectionFormSchema>
export type SectionUpdateData = z.infer<typeof sectionUpdateSchema>
