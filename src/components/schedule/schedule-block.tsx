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

  // Calcular posicion vertical basada en los minutos
  // Si el evento empieza a las 10:25, debe estar 25px hacia abajo en la celda de 10:00
  const startMinutes = startDate.getMinutes()
  const topOffset = (startMinutes / 60) * 60 // 60px = altura de una celda (hora)

  // Calcular altura basada en duracion
  const height = Math.max(duration, 20) // Minimo 20px

  // Calcular cuantas celdas de hora ocupa el evento
  const startHour = startDate.getHours()
  const endHour = endDate ? endDate.getHours() : startHour
  const numCells = endHour - startHour + 1

  return (
    <div
      className={`absolute left-0.5 right-0.5 p-1 rounded-lg border-l-2 ${colorClass} hover:shadow-md transition-shadow group cursor-pointer`}
      style={{
        top: `${topOffset}px`,
        height: `${height}px`,
        minHeight: '20px',
        borderLeftColor: courseColor,
        borderLeftWidth: '3px',
        zIndex: 10,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onEdit(e)
      }}
    >
      <div className="flex flex-col h-full">
        {/* Título del curso/evento */}
        <div className="font-semibold text-[10px] leading-tight truncate">
          {event.course?.code || event.title}
        </div>

        {/* Sala */}
        {event.location && (
          <div className="text-[9px] opacity-75 truncate mt-0.5">
            {event.location}
          </div>
        )}

        {/* Hora */}
        <div className="text-[9px] opacity-60 mt-auto">
          {format(startDate, 'HH:mm')}
          {endDate && ` - ${format(endDate, 'HH:mm')}`}
        </div>

        {/* Botones de acción (visible en hover) */}
        <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 bg-white/80 dark:bg-slate-800/80 rounded">
          <Button
            size="icon"
            variant="ghost"
            className="h-4 w-4 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            title="Eliminar"
          >
            <Trash2 className="h-2.5 w-2.5 text-red-600 dark:text-red-400" />
          </Button>
        </div>
      </div>
    </div>
  )
}
