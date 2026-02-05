/**
 * Diálogo para crear/editar certámenes
 */

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createExam } from '@/lib/actions/exam.actions'
import { useRouter } from 'next/navigation'

interface ExamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: any[]
  onExamCreated?: () => void
}

export function ExamDialog({ open, onOpenChange, courses, onExamCreated }: ExamDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    duration: '',
    courseId: '',
    allowRandom: false,
    showResults: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createExam({
        title: formData.title,
        description: formData.description || undefined,
        date: formData.date ? new Date(formData.date) : undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        courseId: formData.courseId,
        allowRandom: formData.allowRandom,
        showResults: formData.showResults,
      })

      onOpenChange(false)
      onExamCreated?.()
      router.refresh()
    } catch (error) {
      console.error('Error al crear certamen:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Nuevo Certamen</DialogTitle>
          <DialogDescription>
            Completa los datos para crear un nuevo certamen
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título del certamen *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Certamen 1 - Matemáticas"
              required
              className="rounded-xl"
              autoFocus
            />
          </div>

          {/* Curso */}
          <div className="space-y-2">
            <Label htmlFor="course">Curso *</Label>
            <Select
              value={formData.courseId}
              onValueChange={(value) => setFormData({ ...formData, courseId: value })}
              required
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecciona un curso" />
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

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha de aplicación</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="rounded-xl"
            />
          </div>

          {/* Duración */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duración (minutos)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="Ej: 90"
              min="1"
              className="rounded-xl"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el certamen..."
              rows={3}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Opciones adicionales */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowRandom"
                checked={formData.allowRandom}
                onChange={(e) => setFormData({ ...formData, allowRandom: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="allowRandom" className="cursor-pointer">
                Permitir orden aleatorio de preguntas
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showResults"
                checked={formData.showResults}
                onChange={(e) => setFormData({ ...formData, showResults: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="showResults" className="cursor-pointer">
                Mostrar resultados a los alumnos
              </Label>
            </div>
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
              disabled={loading || !formData.courseId}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
            >
              {loading ? 'Creando...' : 'Crear certamen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
