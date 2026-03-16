'use client'

import { useState, useEffect } from 'react'
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ScheduleEvent {
  id: string
  title: string
  type: string
  location?: string | null
  startDate: string
  endDate: string | null
  course?: {
    id: string
    name: string
    color: string | null
    code?: string | null
  } | null
  section?: {
    id: string
    name: string
  } | null
}

interface Course {
  id: string
  name: string
  sections: {
    id: string
    name: string
    active: boolean
  }[]
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7)
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const EVENT_TYPES = [
  { value: 'CLASE', label: 'Clase', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'AYUDANTIA', label: 'Ayudantía', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'LABORATORIO', label: 'Laboratorio', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'EVALUACION', label: 'Evaluación', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'OTRO', label: 'Otro', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
]

export function SimpleScheduleView({ initialEvents, courses }: { initialEvents: ScheduleEvent[]; courses: Course[] }) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })

  const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1))
  const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1))

  const getEventsForSlot = (dayIndex: number, hour: number) => {
    return events.filter(event => {
      const eventStart = parseISO(event.startDate)
      const eventDay = eventStart.getDay() === 0 ? 6 : eventStart.getDay() - 1
      const eventHour = eventStart.getHours()
      return eventDay === dayIndex && eventHour === hour
    })
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return
    
    try {
      const response = await fetch(`/api/schedule/${eventId}`, { method: 'DELETE' })
      if (response.ok) {
        setEvents(events.filter(e => e.id !== eventId))
      }
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  }

  if (!isMounted) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <h2 className="text-lg font-semibold">
                  {format(weekStart, "d MMM", { locale: es })} - {format(weekEnd, "d MMM 'de' yyyy", { locale: es })}
                </h2>
              </div>
              <Button variant="outline" size="icon" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Evento
              </Button>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Evento</DialogTitle>
                  <DialogDescription>
                    Completa los detalles del evento para tu horario semanal
                  </DialogDescription>
                </DialogHeader>
                <EventForm
                  courses={courses}
                  onSuccess={() => {
                    setIsDialogOpen(false)
                    window.location.reload()
                  }}
                  onCancel={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Grid del horario */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header de días */}
            <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b bg-slate-50">
              <div className="p-3 text-center font-medium text-slate-500 text-sm">
                Hora
              </div>
              {DAYS.map((day, index) => {
                const date = new Date(weekStart)
                date.setDate(date.getDate() + index)
                const isToday = isSameDay(date, new Date())
                return (
                  <div
                    key={day}
                    className={`
                      p-3 text-center border-l
                      ${isToday ? 'bg-blue-50 border-b-2 border-b-blue-500' : ''}
                    `}
                  >
                    <div className="font-semibold text-sm">{day}</div>
                    <div className={`text-xs ${isToday ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>
                      {format(date, 'd')}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Grid de horas */}
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[70px_repeat(7,1fr)] border-b last:border-b-0">
                <div className="p-2 text-center text-xs font-medium text-slate-500 bg-slate-50/50 border-r flex items-center justify-center">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const slotEvents = getEventsForSlot(dayIndex, hour)
                  const date = new Date(weekStart)
                  date.setDate(date.getDate() + dayIndex)
                  const isToday = isSameDay(date, new Date())
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`
                        border-r last:border-r-0 p-1 relative min-h-[60px]
                        hover:bg-slate-50/50 transition-colors
                        ${isToday ? 'bg-blue-50/30' : ''}
                      `}
                    >
                      {slotEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`
                            p-2 rounded-md text-xs mb-1 cursor-pointer
                            hover:opacity-90 transition-opacity shadow-sm
                            ${EVENT_TYPES.find(t => t.value === event.type)?.color || 'bg-gray-100'}
                          `}
                          onClick={() => setEditingEvent(event)}
                        >
                          <div className="font-semibold truncate flex items-center gap-1">
                            {event.title}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] opacity-90">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(event.startDate), 'HH:mm')}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 text-[10px] opacity-75">
                              <MapPin className="h-3 w-3" />
                              {event.location}
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
        </CardContent>
      </Card>

      {/* Dialog de edición */}
      {editingEvent && (
        <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Evento</DialogTitle>
              <DialogDescription>
                Opciones para el evento: {editingEvent.title}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 mt-4">
              <Button 
                variant="destructive" 
                onClick={() => {
                  handleDelete(editingEvent.id)
                  setEditingEvent(null)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Evento
              </Button>
              <Button variant="outline" onClick={() => setEditingEvent(null)}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Formulario de evento
function EventForm({ courses, onSuccess, onCancel }: { courses: Course[]; onSuccess: () => void; onCancel: () => void }) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'CLASE',
    location: '',
    dayOfWeek: '1',
    startTime: '08:00',
    endTime: '09:30',
    courseId: '',
    sectionId: '',
    isRecurring: true,
  })

  const selectedCourse = courses.find(c => c.id === formData.courseId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error al guardar:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Nombre del evento"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Ubicación / Sala</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Ej: Sala 302, Laboratorio A"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course">Curso</Label>
          <Select
            value={formData.courseId}
            onValueChange={(value) => {
              setFormData({ 
                ...formData, 
                courseId: value,
                sectionId: '' 
              })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar curso" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="section">Sección</Label>
          <Select
            value={formData.sectionId}
            onValueChange={(value) => setFormData({ ...formData, sectionId: value })}
            disabled={!selectedCourse}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar sección" />
            </SelectTrigger>
            <SelectContent>
              {selectedCourse?.sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dayOfWeek">Día</Label>
          <Select
            value={formData.dayOfWeek}
            onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Lunes</SelectItem>
              <SelectItem value="2">Martes</SelectItem>
              <SelectItem value="3">Miércoles</SelectItem>
              <SelectItem value="4">Jueves</SelectItem>
              <SelectItem value="5">Viernes</SelectItem>
              <SelectItem value="6">Sábado</SelectItem>
              <SelectItem value="0">Domingo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Hora inicio</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">Hora fin</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Evento'}
        </Button>
      </div>
    </form>
  )
}
