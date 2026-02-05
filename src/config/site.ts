/**
 * Configuración del sitio DOCNT
 * Información global sobre la aplicación
 */

export const siteConfig = {
  name: 'DOCNT',
  description: 'Sistema de Gestión Docente Personal',
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  version: '1.0.0',

  // Configuración de autenticación
  auth: {
    allowNewRegistration: false, // Solo el docente principal puede registrarse
  },

  // Configuración de subida de archivos
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/markdown',
      'image/jpeg',
      'image/png',
      'image/gif',
    ],
  },

  // Configuración del calendario
  calendar: {
    defaultView: 'month' as const,
    weekStartsOn: 0, // Domingo
    minTime: '07:00',
    maxTime: '22:00',
  },
}

export type SiteConfig = typeof siteConfig
