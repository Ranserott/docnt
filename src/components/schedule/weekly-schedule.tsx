'use client'

import { useState } from 'react'
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

// Tipos
interface Course {
  id: string
  name: string
  code?: string | null
  color?: string | null
}

interface Section {
  id: string
  name: string
}

interface ScheduleEvent {
  id: string
  title: string
  startDate: Date
  endDate?: Date | null
  location?: string | null
  type: string
  isRecurring: boolean
  course?: Course | null
  section?: Section | null
}

interface WeeklyScheduleProps {
  initialEvents: ScheduleEvent[]
  courses: Array<{
    id: string
    name: string
    code?: string | null
    color?: string | null
    sections: Array<{
      id: string
      name: string
      active: boolean
    }>
  }>
}

// Configuración
const typeLabels: Record<string, string> = {
  CLASE: 'Clase',
  EVALUACION: 'Evaluación',
  ENTREGA: 'Entrega',
  REUNION: 'Reunión',
  OTRO: 'Otro',
}

const typeColors: Record<string, string> = {
  CLASE: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300',
  EVALUACION: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300',
  ENTREGA: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
  REUNION: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/30 dark:text-violet-300',
  OTRO: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/30 dark:text-slate-300',
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7)

const WEEKDAYS = [
  { id: 1, name: 'Lunes', short: 'Lun' },
  { id: 2, name: 'Martes', short: 'Mar' },
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' },
  { id: 5, name: 'Viernes', short: 'Vie' },
]

export function WeeklySchedule({ initialEvents, courses }: WeeklyScheduleProps) {
  const [currentWeek, setCurrentWeek] = useState(() => new Date())
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 6)

  const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1))
  const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1))
  const todayWeek = () => setCurrentWeek(new Date())

  const getEventsForSlot = (dayId: number, hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      const eventDay = eventDate.getDay() === 0 ? 7 : eventDate.getDay()
      const eventHour = eventDate.getHours()
      return eventDay === dayId && eventHour === hour
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Horario Semanal</CardTitle>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {format(weekStart, "d 'de' MMMM", { locale: es })} - {format(weekEnd, "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={todayWeek}>
                Hoy
              </Button>
              <Button variant="outline" size="sm" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grid del horario */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header de días */}
              <div className="grid grid-cols-[80px_1fr] border-b">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border-r">
                  <span className="text-xs font-medium text-slate-500">Hora</span>
                </div>
                <div className="grid grid-cols-5">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day.id}
                      className={cn(
                        "p-3 text-center border-r last:border-r-0",
                        isSameDay(addDays(weekStart, day.id - 1), new Date()) && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                    >
                      <div className="text-sm font-semibold">{day.name}</div>
                      <div className="text-xs text-slate-500">
                        {format(addDays(weekStart, day.id - 1), 'd MMM', { locale: es })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid de horas */}
              <div className="grid grid-cols-[80px_1fr]">
                {/* Columna de horas */}
                <div className="border-r">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="h-16 border-b px-2 flex items-center justify-center"
                    >
                      <span className="text-xs font-medium text-slate-500">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grid de eventos */}
                <div className="grid grid-cols-5">
                  {WEEKDAYS.map((day) => (
                    <div key={day.id} className="border-r last:border-r-0">
                      {HOURS.map((hour) => {
                        const slotEvents = getEventsForSlot(day.id, hour)
                        
                        return (
                          <div
                            key={`${day.id}-${hour}`}
                            className="h-16 border-b relative hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                            onClick={() => setShowAddDialog(true)}
                          >
                            {slotEvents.map((event) => (
                              <div
                                key={event.id}
                                className={cn(
                                  "absolute inset-1 rounded-md p-1.5 text-xs border overflow-hidden",
                                  typeColors[event.type] || typeColors.other
                                )}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Editar evento
                                }}
                              >
                                <div className="font-semibold truncate">
                                  {event.course?.name || event.title}
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-0.5 mt-0.5 opacity-75">
                                    <MapPin className="h-2.5 w-2.5" />
                                    <span className="truncate">{event.location}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {Object.entries(typeLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={cn("w-4 h-4 rounded border", typeColors[key].split(' ')[0])} />
                <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog placeholder - se implementará más adelante */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Agregar al Horario</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Funcionalidad en desarrollo. Pronto podrás agregar eventos.
              </p>
              <Button onClick={() => setShowAddDialog(false)}>
                Cerrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
