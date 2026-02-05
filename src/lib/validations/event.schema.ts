/**
 * Validaciones Zod para Eventos del Calendario
 */

import { z } from 'zod'
import { EventType } from '@prisma/client'

export const eventFormSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),
  description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  type: z.nativeEnum(EventType, {
    required_error: 'El tipo de evento es requerido',
  }),
  startDate: z.date({
    required_error: 'La fecha de inicio es requerida',
  }),
  endDate: z.date().optional(),
  allDay: z.boolean().default(false),
  location: z.string().max(200, 'Máximo 200 caracteres').optional(),
  notes: z.string().max(5000, 'Máximo 5000 caracteres').optional(),
  observations: z.string().max(5000, 'Máximo 5000 caracteres').optional(),
  courseId: z.string().cuid().optional(),
  sectionId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).optional(),
  status: z.string().default('scheduled'),
})

export const eventUpdateSchema = eventFormSchema.partial().extend({
  id: z.string().cuid(),
})

export const eventDeleteSchema = z.object({
  id: z.string().cuid(),
})

export const eventQuerySchema = z.object({
  courseId: z.string().cuid().optional(),
  sectionId: z.string().cuid().optional(),
  type: z.nativeEnum(EventType).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  tagIds: z.array(z.string().cuid()).optional(),
})

export type EventFormData = z.infer<typeof eventFormSchema>
export type EventUpdateData = z.infer<typeof eventUpdateSchema>
export type EventQueryParams = z.infer<typeof eventQuerySchema>
