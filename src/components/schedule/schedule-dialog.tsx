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

const DURATION_OPTIONS = [
  { value: '30', label: '30 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1.5 horas' },
  { value: '120', label: '2 horas' },
  { value: '150', label: '2.5 horas' },
  { value: '180', label: '3 horas' },
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
    duration: '90',
    isRecurring: true,
  })

  // Resetear formulario cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      if (editingEvent) {
        // Modo edición
        const startDate = new Date(editingEvent.startDate)
        const endDate = editingEvent.endDate ? new Date(editingEvent.endDate) : null
        const duration = endDate ? (endDate.getTime() - startDate.getTime()) / (1000 * 60) : 90
        const dayOfWeek = startDate.getDay().toString()

        setFormData({
          title: editingEvent.title,
          description: editingEvent.description || '',
          type: editingEvent.type,
          courseId: editingEvent.courseId || '',
          sectionId: editingEvent.sectionId || '',
          location: editingEvent.location || '',
          dayOfWeek,
          startHour: startDate.getHours().toString(),
          duration: duration.toString(),
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
          startHour: selectedSlot.hour.toString(),
          duration: '90',
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
          startHour: '8',
          duration: '90',
          isRecurring: true,
        })
      }
    }
  }, [open, editingEvent, selectedSlot])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
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
          duration: parseInt(formData.duration),
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
          startMinute: 0,
          duration: parseInt(formData.duration),
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

          {/* Día y hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="day">Día</Label>
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

            <div>
              <Label htmlFor="startHour">Hora Inicio</Label>
              <Select
                value={formData.startHour}
                onValueChange={(value) => setFormData({ ...formData, startHour: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Hora" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 16 }, (_, i) => i + 7).map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {hour}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duración */}
          <div>
            <Label htmlFor="duration">Duración</Label>
            <Select
              value={formData.duration}
              onValueChange={(value) => setFormData({ ...formData, duration: value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Duración" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
