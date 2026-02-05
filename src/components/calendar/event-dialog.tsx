/**
 * Diálogo para crear/editar eventos del calendario
 */

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createEvent, updateEvent } from '@/lib/actions/calendar.actions'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const eventTypes = [
  { value: 'CLASE', label: 'Clase', color: 'bg-green-500' },
  { value: 'EVALUACION', label: 'Evaluación', color: 'bg-red-500' },
  { value: 'ENTREGA', label: 'Entrega', color: 'bg-yellow-500' },
  { value: 'REUNION', label: 'Reunión', color: 'bg-blue-500' },
  { value: 'OTRO', label: 'Otro', color: 'bg-gray-500' },
]

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: any
  date?: Date
  courses: any[]
  onEventCreated?: () => void
}

export function EventDialog({ open, onOpenChange, event, date, courses, onEventCreated }: EventDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    type: event?.type || 'CLASE',
    allDay: true,
    location: event?.location || '',
    notes: event?.notes || '',
    courseId: event?.courseId || '',
    sectionId: event?.sectionId || '',
  })

  const selectedCourse = courses.find((c) => c.id === formData.courseId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Usar la fecha seleccionada o la del evento existente
      const eventDate = event ? new Date(event.startDate) : (date || new Date())

      // Crear evento para todo el día (desde 00:00 hasta 23:59 del mismo día)
      const startDate = new Date(eventDate)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(eventDate)
      endDate.setHours(23, 59, 59, 999)

      const data = {
        ...formData,
        startDate,
        endDate,
        courseId: formData.courseId || undefined,
        sectionId: formData.sectionId || undefined,
        status: 'scheduled',
      }

      if (event) {
        await updateEvent(event.id, data)
      } else {
        await createEvent(data)
      }

      onOpenChange(false)
      onEventCreated?.()
      router.refresh()
    } catch (error) {
      console.error('Error al guardar evento:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {event ? 'Editar Evento' : 'Nuevo Evento'}
          </DialogTitle>
          <DialogDescription>
            {date && !event && (
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {format(date, 'EEEE d MMMM, yyyy', { locale: es })}
              </span>
            )}
            {event && 'Modifica los detalles del evento'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Clase de Matemáticas"
              required
              className="rounded-xl"
              autoFocus
            />
          </div>

          {/* Tipo de evento */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de evento</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${type.color}`} />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Curso */}
          <div className="space-y-2">
            <Label htmlFor="course">Curso relacionado</Label>
            <Select
              value={formData.courseId}
              onValueChange={(value) => setFormData({ ...formData, courseId: value, sectionId: '' })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecciona un curso (opcional)" />
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

          {/* Sección */}
          {selectedCourse && selectedCourse.sections && selectedCourse.sections.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="section">Sección</Label>
              <Select
                value={formData.sectionId}
                onValueChange={(value) => setFormData({ ...formData, sectionId: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecciona una sección" />
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

          {/* Ubicación */}
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación / Sala</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ej: Sala 301, Online"
              className="rounded-xl"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el evento..."
              rows={3}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Notas privadas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas privadas</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas solo visibles para ti..."
              rows={2}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
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
              className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
            >
              {loading ? 'Guardando...' : event ? 'Guardar cambios' : 'Crear evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
