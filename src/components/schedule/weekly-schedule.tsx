'use client'

import { useState } from 'react'
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, MapPin, Trash2, Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createScheduleBlock, deleteScheduleBlock } from '@/lib/actions/schedule.actions'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [currentWeek, setCurrentWeek] = useState(() => new Date())
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    courseId: '',
    sectionId: '',
    title: '',
    dayOfWeek: '1',
    startHour: '8',
    startMinute: '0',
    duration: '90',
    location: '',
    type: 'CLASE',
    isRecurring: true,
  })

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

  const handleSlotClick = (day: number, hour: number) => {
    setSelectedSlot({ day, hour })
    setFormData(prev => ({
      ...prev,
      dayOfWeek: day.toString(),
      startHour: hour.toString(),
    }))
    setShowAddDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await createScheduleBlock({
        courseId: formData.courseId || undefined,
        sectionId: formData.sectionId || undefined,
        title: formData.title || 'Sin título',
        type: formData.type,
        location: formData.location,
        dayOfWeek: parseInt(formData.dayOfWeek),
        startHour: parseInt(formData.startHour),
        startMinute: parseInt(formData.startMinute),
        duration: parseInt(formData.duration),
        isRecurring: formData.isRecurring,
      })

      if (result.error) {
        alert(result.error)
      } else {
        setShowAddDialog(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear el evento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      return
    }

    try {
      const result = await deleteScheduleBlock(eventId)
      if (result.error) {
        alert(result.error)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el evento')
    }
  }

  const selectedCourse = courses.find(c => c.id === formData.courseId)

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
                            onClick={() => handleSlotClick(day.id, hour)}
                          >
                            {slotEvents.map((event) => (
                              <div
                                key={event.id}
                                className={cn(
                                  "absolute inset-1 rounded-md p-1.5 text-xs border overflow-hidden group",
                                  typeColors[event.type] || typeColors.OTRO
                                )}
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <div className="font-semibold truncate flex-1">
                                    {event.course?.name || event.title}
                                  </div>
                                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete(event.id)
                                      }}
                                      className="p-0.5 hover:bg-red-100 rounded text-red-600"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
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

      {/* Modal para agregar/editar evento */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Agregar al Horario</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Asignatura */}
                <div className="space-y-2">
                  <Label htmlFor="course">Asignatura *</Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una asignatura" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name} {course.code && `(${course.code})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sección (si la asignatura tiene secciones) */}
                {selectedCourse && selectedCourse.sections.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="section">Sección</Label>
                    <Select
                      value={formData.sectionId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, sectionId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una sección" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCourse.sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Título (opcional, si no se selecciona curso) */}
                {!formData.courseId && (
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Reunión de facultad"
                    />
                  </div>
                )}

                {/* Día y Tipo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="day">Día *</Label>
                    <Select
                      value={formData.dayOfWeek}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, dayOfWeek: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar día" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEEKDAYS.map((day) => (
                          <SelectItem key={day.id} value={day.id.toString()}>
                            {day.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Horarios */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startHour">Hora Inicio *</Label>
                    <Select
                      value={formData.startHour}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, startHour: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURS.map((hour) => (
                          <SelectItem key={hour} value={hour.toString()}>
                            {hour.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startMinute">Minuto</Label>
                    <Select
                      value={formData.startMinute}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, startMinute: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">:00</SelectItem>
                        <SelectItem value="15">:15</SelectItem>
                        <SelectItem value="30">:30</SelectItem>
                        <SelectItem value="45">:45</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración (min) *</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Minutos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="90">1.5 horas</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                        <SelectItem value="180">3 horas</SelectItem>
                        <SelectItem value="240">4 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Ubicación / Sala */}
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación / Sala</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ej: Sala A-101, Edificio Principal, etc."
                  />
                </div>

                {/* Recurrente */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    className="rounded border-slate-300"
                  />
                  <Label htmlFor="isRecurring" className="font-normal">
                    Evento recurrente (se repite todas las semanas)
                  </Label>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddDialog(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting || (!formData.courseId && !formData.title)}
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
