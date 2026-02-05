/**
 * Validaciones Zod para Archivos
 */

import { z } from 'zod'

export const fileUploadSchema = z.object({
  file: z.instanceof(File, {
    message: 'Se requiere un archivo',
  }).refine(
    (file) => file.size <= 10 * 1024 * 1024,
    'El archivo debe pesar menos de 10MB'
  ),
  name: z.string().max(200, 'Máximo 200 caracteres').optional(),
  description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  courseId: z.string().cuid().optional(),
  eventIds: z.array(z.string().cuid()).optional(),
})

export const fileUpdateSchema = z.object({
  id: z.string().cuid(),
  name: z.string().max(200, 'Máximo 200 caracteres').optional(),
  description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  content: z.string().max(10000, 'Máximo 10000 caracteres').optional(),
})

export const fileDeleteSchema = z.object({
  id: z.string().cuid(),
})

export const fileLinkSchema = z.object({
  fileId: z.string().cuid(),
  eventIds: z.array(z.string().cuid()).min(1, 'Debe seleccionar al menos un evento'),
})

export const fileUnlinkSchema = z.object({
  fileId: z.string().cuid(),
  eventId: z.string().cuid(),
})

export type FileUploadData = z.infer<typeof fileUploadSchema>
export type FileUpdateData = z.infer<typeof fileUpdateSchema>
export type FileLinkData = z.infer<typeof fileLinkSchema>
