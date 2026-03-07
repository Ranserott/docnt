/**
 * Componente de Bloque de Horario Individual
 * Muestra un evento/bloque en el grid del horario
 */

'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ScheduleBlockProps {
  event: {
    id: string
    title: string
    type: string
    location?: string
    startDate: Date | string
    endDate: Date | string | null
    course?: {
      id: string
      name: string
      color: string
      code?: string
    } | null
    section?: {
      id: string
      name: string
    } | null
  }
  onEdit: (e: React.MouseEvent) => void
  onDelete: () => void
}

const eventColors = {
  CLASE: 'bg-green-100 text-green-800 border-green-400 dark:bg-green-900/40 dark:text-green-200 dark:border-green-600',
  AYUDANTIA: 'bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-600',
  LABORATORIO: 'bg-purple-100 text-purple-800 border-purple-400 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-600',
  EVALUACION: 'bg-red-100 text-red-800 border-red-400 dark:bg-red-900/40 dark:text-red-200 dark:border-red-600',
  OTRO: 'bg-gray-100 text-gray-800 border-gray-400 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-600',
}

export function ScheduleBlock({ event, onEdit, onDelete }: ScheduleBlockProps) {
  const startDate = new Date(event.startDate)
  const endDate = event.endDate ? new Date(event.endDate) : null
  const duration = endDate ? (endDate.getTime() - startDate.getTime()) / (1000 * 60) : 60

  const colorClass = eventColors[event.type as keyof typeof eventColors] || eventColors.OTRO
  const courseColor = event.course?.color || '#3b82f6'

  // Calcular altura basada en duración (60px por hora)
  const height = Math.max(duration, 30) // Mínimo 30px

  return (
    <div
      className={`absolute inset-0 m-0.5 p-2 rounded-lg border-l-2 ${colorClass} hover:shadow-md transition-shadow group`}
      style={{
        minHeight: `${height}px`,
        borderLeftColor: courseColor,
        borderLeftWidth: '4px',
      }}
      onClick={(e) => {
        e.stopPropagation()
        onEdit(e)
      }}
    >
      <div className="flex flex-col h-full">
        {/* Título del curso/evento */}
        <div className="font-semibold text-xs leading-tight truncate">
          {event.course?.code || event.title}
        </div>

        {/* Sala */}
        {event.location && (
          <div className="text-[10px] opacity-75 truncate mt-0.5">
            📍 {event.location}
          </div>
        )}

        {/* Hora */}
        <div className="text-[10px] opacity-60 mt-auto">
          {format(startDate, 'HH:mm')}
          {endDate && ` - ${format(endDate, 'HH:mm')}`}
        </div>

        {/* Botones de acción (visible en hover) */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5 p-0 hover:bg-white/50"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
