/**
 * Diálogo para Crear/Editar Bloque de Horario
 */

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createScheduleBlock, updateScheduleBlock } from '@/lib/actions/schedule.actions'

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: any[]
  selectedSlot?: { day: number; hour: number } | null
  editingEvent?: any
  onSaved: () => void
}

const DAYS = [
  { value: '1', label: 'Lunes' },
  { value: '2', label: 'Martes' },
  { value: '3', label: 'Miércoles' },
  { value: '4', label: 'Jueves' },
  { value: '5', label: 'Viernes' },
  { value: '6', label: 'Sábado' },
  { value: '0', label: 'Domingo' },
]

const EVENT_TYPES = [
  { value: 'CLASE', label: 'Clase' },
  { value: 'AYUDANTIA', label: 'Ayudantía' },
  { value: 'LABORATORIO', label: 'Laboratorio' },
  { value: 'EVALUACION', label: 'Evaluación' },
  { value: 'OTRO', label: 'Otro' },
]

export function ScheduleDialog({
  open,
  onOpenChange,
  courses,
  selectedSlot,
  editingEvent,
  onSaved,
}: ScheduleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'CLASE',
    courseId: '',
    sectionId: '',
    location: '',
    dayOfWeek: '1',
    startHour: '8',
    startMinute: '0',
    endHour: '9',
    endMinute: '30',
    isRecurring: true,
  })

  // Resetear formulario cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      if (editingEvent) {
        // Modo edición
        const startDate = new Date(editingEvent.startDate)
        const endDate = editingEvent.endDate ? new Date(editingEvent.endDate) : null
        const dayOfWeek = startDate.getDay().toString()

        setFormData({
          title: editingEvent.title,
          description: editingEvent.description || '',
          type: editingEvent.type,
          courseId: editingEvent.courseId || '',
          sectionId: editingEvent.sectionId || '',
          location: editingEvent.location || '',
          dayOfWeek,
          startHour: startDate.getHours().toString().padStart(2, '0'),
          startMinute: startDate.getMinutes().toString().padStart(2, '0'),
          endHour: endDate ? endDate.getHours().toString().padStart(2, '0') : '9',
          endMinute: endDate ? endDate.getMinutes().toString().padStart(2, '0') : '30',
          isRecurring: editingEvent.isRecurring || false,
        })
      } else if (selectedSlot) {
        // Modo creación con slot seleccionado
        setFormData({
          title: '',
          description: '',
          type: 'CLASE',
          courseId: '',
          sectionId: '',
          location: '',
          dayOfWeek: selectedSlot.day.toString(),
          startHour: selectedSlot.hour.toString().padStart(2, '0'),
          startMinute: '0',
          endHour: (selectedSlot.hour + 1).toString().padStart(2, '0'),
          endMinute: '30',
          isRecurring: true,
        })
      } else {
        // Modo creación sin selección
        setFormData({
          title: '',
          description: '',
          type: 'CLASE',
          courseId: '',
          sectionId: '',
          location: '',
          dayOfWeek: '1',
          startHour: '08',
          startMinute: '0',
          endHour: '09',
          endMinute: '30',
          isRecurring: true,
        })
      }
    }
  }, [open, editingEvent, selectedSlot])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Calcular duración basada en hora inicio y hora fin
      const startDateTime = new Date()
      startDateTime.setHours(parseInt(formData.startHour), parseInt(formData.startMinute), 0, 0)

      const endDateTime = new Date()
      endDateTime.setHours(parseInt(formData.endHour), parseInt(formData.endMinute), 0, 0)

      // Validar que hora fin sea posterior a hora inicio
      if (endDateTime <= startDateTime) {
        alert('La hora de fin debe ser posterior a la hora de inicio')
        setLoading(false)
        return
      }

      const duration = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)

      if (editingEvent) {
        // Actualizar evento existente
        await updateScheduleBlock(editingEvent.id, {
          title: formData.title,
          description: formData.description || undefined,
          type: formData.type,
          courseId: formData.courseId || undefined,
          sectionId: formData.sectionId || undefined,
          location: formData.location || undefined,
          dayOfWeek: parseInt(formData.dayOfWeek),
          startHour: parseInt(formData.startHour),
          startMinute: parseInt(formData.startMinute),
          duration: Math.round(duration),
          isRecurring: formData.isRecurring,
        })
      } else {
        // Crear nuevo evento
        await createScheduleBlock({
          title: formData.title,
          description: formData.description || undefined,
          type: formData.type,
          courseId: formData.courseId || undefined,
          sectionId: formData.sectionId || undefined,
          location: formData.location || undefined,
          dayOfWeek: parseInt(formData.dayOfWeek),
          startHour: parseInt(formData.startHour),
          startMinute: parseInt(formData.startMinute),
          duration: Math.round(duration),
          isRecurring: formData.isRecurring,
        })
      }

      onSaved()
    } catch (error) {
      console.error('Error al guardar bloque de horario:', error)
      alert('Error al guardar el bloque de horario')
    } finally {
      setLoading(false)
    }
  }

  const selectedCourse = courses.find((c) => c.id === formData.courseId)

  // Autocompletar título con el nombre del curso
  useEffect(() => {
    if (selectedCourse && !editingEvent && !formData.title) {
      setFormData({ ...formData, title: selectedCourse.name })
    }
  }, [selectedCourse])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? 'Editar Bloque de Horario' : 'Nuevo Bloque de Horario'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de evento */}
          <div>
            <Label htmlFor="type">Tipo de Evento</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecciona tipo" />
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

          {/* Curso */}
          <div>
            <Label htmlFor="course">Curso (opcional)</Label>
            <Select
              value={formData.courseId}
              onValueChange={(value) => setFormData({ ...formData, courseId: value, sectionId: '' })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecciona curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: course.color || '#3b82f6' }}
                      />
                      {course.name}
                      {course.code && <span className="text-xs text-slate-500">({course.code})</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sección (si hay curso seleccionado) */}
          {selectedCourse && selectedCourse.sections?.length > 0 && (
            <div>
              <Label htmlFor="section">Sección</Label>
              <Select
                value={formData.sectionId}
                onValueChange={(value) => setFormData({ ...formData, sectionId: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecciona sección" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCourse.sections.map((section: any) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Título */}
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Matemáticas I"
              className="rounded-xl"
              required
            />
          </div>

          {/* Sala */}
          <div>
            <Label htmlFor="location">Sala</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ej: Sala 301"
              className="rounded-xl"
            />
          </div>

          {/* Día y horario */}
          <div>
            <Label>Día de la semana</Label>
            <Select
              value={formData.dayOfWeek}
              onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Día" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hora inicio */}
          <div>
            <Label>Hora de inicio</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={formData.startHour}
                onValueChange={(value) => setFormData({ ...formData, startHour: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Hora" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 16 }, (_, i) => i + 7).map((hour) => (
                    <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                      {hour.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.startMinute}
                onValueChange={(value) => setFormData({ ...formData, startMinute: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((min) => (
                    <SelectItem key={min} value={min.toString().padStart(2, '0')}>
                      {min.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hora fin */}
          <div>
            <Label>Hora de fin</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={formData.endHour}
                onValueChange={(value) => setFormData({ ...formData, endHour: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Hora" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 16 }, (_, i) => i + 7).map((hour) => (
                    <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                      {hour.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.endMinute}
                onValueChange={(value) => setFormData({ ...formData, endMinute: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((min) => (
                    <SelectItem key={min} value={min.toString().padStart(2, '0')}>
                      {min.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Duracion: {Math.round((parseInt(formData.endHour) * 60 + parseInt(formData.endMinute)) - (parseInt(formData.startHour) * 60 + parseInt(formData.startMinute)))} minutos
            </p>
          </div>

          {/* Recurrente */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="isRecurring" className="cursor-pointer">
              Repetir semanalmente (recurrente)
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white"
            >
              {loading ? 'Guardando...' : editingEvent ? 'Guardar Cambios' : 'Crear Bloque'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
