/**
 * Componente de Calendario Interactivo
 * Soporta vistas mensual y semanal con gestión de eventos
 */

'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CalendarDays, Plus, Trash2, Edit } from 'lucide-react'
import { EventDialog } from './event-dialog'
import { getEvents, deleteEvent } from '@/lib/actions/calendar.actions'

type ViewType = 'month' | 'week'

const eventColors = {
  CLASE: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  EVALUACION: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  ENTREGA: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  REUNION: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  OTRO: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
}

interface CalendarViewProps {
  initialEvents: any[]
  courses: any[]
}

export function CalendarView({ initialEvents, courses }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>('month')
  const [events, setEvents] = useState(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewingEvent, setViewingEvent] = useState<any>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))
    }
  }

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setDialogOpen(true)
  }

  const handleEventClick = (e: React.MouseEvent, event: any) => {
    e.stopPropagation()
    setViewingEvent(event)
  }

  const handleDeleteEvent = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation()
    if (confirm('¿Estás seguro de eliminar este evento?')) {
      await deleteEvent(eventId)
      setEvents(events.filter((ev) => ev.id !== eventId))
    }
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate)
      return isSameDay(eventDate, date)
    })
  }

  const currentDays = view === 'month' ? days : weekDays

  return (
    <>
      <Card className="border-slate-200 dark:border-slate-800">
        {/* Header del calendario */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {format(currentDate, view === 'month' ? 'MMMM yyyy' : "'Semana del' MMM yyyy", { locale: es })}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="h-9 w-9 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleToday}
                className="h-9 w-9 rounded-xl"
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="h-9 w-9 rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-200 p-1 dark:border-slate-700">
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
                className={view === 'month' ? 'rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white' : 'rounded-lg'}
              >
                Mes
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
                className={view === 'week' ? 'rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white' : 'rounded-lg'}
              >
                Semana
              </Button>
            </div>
            <Button
              onClick={() => {
                setSelectedDate(new Date())
                setSelectedEvent(null)
                setDialogOpen(true)
              }}
              className="h-10 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Evento
            </Button>
          </div>
        </div>

        {/* Grid del calendario */}
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {/* Encabezados de días */}
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">
                {day}
              </div>
            ))}

            {/* Días */}
            {currentDays.map((date) => {
              const dateEvents = getEventsForDate(date)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isDayToday = isToday(date)

              return (
                <div
                  key={date.toISOString()}
                  onClick={() => handleDayClick(date)}
                  className={`min-h-28 rounded-xl border-2 p-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                    isDayToday
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100/50 shadow-md dark:from-green-950/50 dark:to-green-900/20'
                      : isCurrentMonth
                      ? 'border-slate-200 bg-white hover:border-green-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-green-700'
                      : 'border-slate-100 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-900/50'
                  }`}
                >
                  <div className={`text-sm font-bold mb-1 ${
                    isDayToday ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {format(date, 'd')}
                  </div>

                  {/* Eventos del día */}
                  <div className="space-y-1">
                    {dateEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => handleEventClick(e, event)}
                        className={`group relative px-2 py-1 rounded-lg text-xs font-medium border truncate cursor-pointer transition-all hover:shadow-sm ${
                          eventColors[event.type as keyof typeof eventColors]
                        }`}
                      >
                        {event.title}
                        <div className="absolute right-1 top-1 hidden gap-1 group-hover:flex">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedEvent(event)
                              setDialogOpen(true)
                            }}
                            className="p-0.5 hover:bg-white/20 rounded"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteEvent(e, event.id)}
                            className="p-0.5 hover:bg-white/20 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {dateEvents.length > 3 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 px-2">
                        +{dateEvents.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de crear/editar evento */}
      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={selectedEvent}
        date={selectedDate || undefined}
        courses={courses}
      />

      {/* Modal de ver evento */}
      {viewingEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewingEvent(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {viewingEvent.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {format(new Date(viewingEvent.startDate), 'EEEE d MMMM, yyyy', { locale: es })}
                  {!viewingEvent.allDay && (
                    <> • {format(new Date(viewingEvent.startDate), 'HH:mm')}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => setViewingEvent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            {viewingEvent.description && (
              <div className="mb-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {viewingEvent.description}
                </p>
              </div>
            )}

            {viewingEvent.location && (
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                📍 {viewingEvent.location}
              </div>
            )}

            {viewingEvent.course && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  {viewingEvent.course.name}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setSelectedEvent(viewingEvent)
                  setViewingEvent(null)
                  setDialogOpen(true)
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                onClick={async () => {
                  if (confirm('¿Eliminar este evento?')) {
                    await deleteEvent(viewingEvent.id)
                    setEvents(events.filter((e) => e.id !== viewingEvent.id))
                    setViewingEvent(null)
                  }
                }}
                variant="destructive"
                className="rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
