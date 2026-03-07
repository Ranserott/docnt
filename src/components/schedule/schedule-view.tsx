/**
 * Vista de Horario Semanal
 * Grid de 7 días (Lun-Dom) x 15 horas (7:00-22:00)
 */

'use client'

import { useState, useEffect } from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, startOfDay, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from 'lucide-react'
import { ScheduleDialog } from './schedule-dialog'
import { ScheduleBlock } from './schedule-block'
import { deleteScheduleBlock } from '@/lib/actions/schedule.actions'

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7:00 a 22:00
const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

const eventColors = {
  CLASE: 'bg-green-100 text-green-800 border-green-400 dark:bg-green-900/40 dark:text-green-200 dark:border-green-600',
  AYUDANTIA: 'bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-600',
  LABORATORIO: 'bg-purple-100 text-purple-800 border-purple-400 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-600',
  EVALUACION: 'bg-red-100 text-red-800 border-red-400 dark:bg-red-900/40 dark:text-red-200 dark:border-red-600',
  OTRO: 'bg-gray-100 text-gray-800 border-gray-400 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-600',
}

interface ScheduleViewProps {
  initialEvents: any[]
  courses: any[]
}

export function ScheduleView({ initialEvents, courses }: ScheduleViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [events, setEvents] = useState(initialEvents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Recargar eventos cuando cambia la semana
  useEffect(() => {
    reloadEvents()
  }, [currentWeek])

  const reloadEvents = async () => {
    setLoading(true)
    try {
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
      const response = await fetch('/api/schedule/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart: weekStart.toISOString() }),
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error al recargar eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const handleToday = () => {
    setCurrentWeek(new Date())
  }

  const handleSlotClick = (dayIndex: number, hour: number) => {
    setSelectedSlot({ day: dayIndex, hour })
    setEditingEvent(null)
    setDialogOpen(true)
  }

  const handleEventClick = (e: React.MouseEvent, event: any) => {
    e.stopPropagation()
    setEditingEvent(event)
    setSelectedSlot(null)
    setDialogOpen(true)
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Estas seguro de eliminar este bloque de horario?')) {
      await deleteScheduleBlock(eventId)
      reloadEvents()
    }
  }

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const isCurrentWeek = isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 }))

  // Agrupar eventos por dia y hora
  const getEventsForSlot = (dayIndex: number, hour: number) => {
    return events.filter((event) => {
      const eventDay = getDay(new Date(event.startDate))
      const eventHour = new Date(event.startDate).getHours()
      // Ajustar dia de la semana (0=Dom, 1=Lun, etc.) a nuestro indice (0=Lun, 6=Dom)
      const adjustedDay = eventDay === 0 ? 6 : eventDay - 1
      return adjustedDay === dayIndex && eventHour === hour
    })
  }

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Horario Semanal
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {format(weekStart, "d MMM", { locale: es })} - {format(weekEnd, "d MMM", { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousWeek}
            className="rounded-xl"
            title="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={handleToday}
            className="rounded-xl"
            disabled={isCurrentWeek}
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Hoy
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextWeek}
            className="rounded-xl"
            title="Semana siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => {
              setEditingEvent(null)
              setSelectedSlot(null)
              setDialogOpen(true)
            }}
            className="ml-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Bloque
          </Button>
        </div>
      </div>

      {/* Grid del horario */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Encabezado de dias */}
              <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800">
                <div className="p-3 text-center font-semibold text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
                  Hora
                </div>
                {DAYS.map((day, index) => {
                  const dayDate = new Date(weekStart)
                  dayDate.setDate(dayDate.getDate() + index)
                  const isToday = isSameDay(dayDate, new Date())

                  return (
                    <div
                      key={day}
                      className={`p-3 text-center font-semibold text-sm border-r border-slate-200 dark:border-slate-800 ${
                        isToday
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>

              {/* Filas de horas */}
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800">
                  {/* Columna de hora */}
                  <div className="p-2 text-center text-xs text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    {hour}:00
                  </div>

                  {/* Columnas de dias */}
                  {DAYS.map((_, dayIndex) => {
                    const slotEvents = getEventsForSlot(dayIndex, hour)

                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className="relative min-h-[60px] border-r border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        onClick={() => handleSlotClick(dayIndex, hour)}
                      >
                        {slotEvents.map((event) => (
                          <ScheduleBlock
                            key={event.id}
                            event={event}
                            onEdit={(e) => handleEventClick(e, event)}
                            onDelete={() => handleDeleteEvent(event.id)}
                          />
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogo para crear/editar */}
      <ScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        courses={courses}
        selectedSlot={selectedSlot}
        editingEvent={editingEvent}
        onSaved={() => {
          reloadEvents()
          setDialogOpen(false)
          setEditingEvent(null)
          setSelectedSlot(null)
        }}
      />
    </div>
  )
}
