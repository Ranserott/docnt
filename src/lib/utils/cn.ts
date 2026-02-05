import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind CSS de forma inteligente
 * Resuelve conflictos y duplicaciones
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
