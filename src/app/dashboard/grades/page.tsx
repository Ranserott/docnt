/**
 * Página de Notas y Corrección de Exámenes con Visión
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, CheckSquare, Camera, Save, Users, FileText, Upload, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getCourses } from '@/lib/actions/course.actions'
import { getExams } from '@/lib/actions/exam.actions'
import { getGrades, getGradingRubric, upsertGrade, upsertGradingRubric } from '@/lib/actions/grade.actions'
import { getStudents, createStudent } from '@/lib/actions/student.actions'

type Status = 'pending' | 'graded' | 'auto_graded'

export default function GradesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedExamId, setSelectedExamId] = useState('')
  const [grades, setGrades] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [rubric, setRubric] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Dialogs
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  const [rubricDialogOpen, setRubricDialogOpen] = useState(false)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState<any>(null)

  // Formularios
  const [studentForm, setStudentForm] = useState({ name: '', email: '', studentCode: '' })
  const [rubricForm, setRubricForm] = useState({ name: '', rubric: '{}', points: '{}', imageUrl: '' })
  const [gradingForm, setGradingForm] = useState({ imageUrl: '', rubric: '{}', points: '{}' })

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    if (selectedCourseId) {
      loadExams()
      loadStudents()
    }
  }, [selectedCourseId])

  useEffect(() => {
    if (selectedExamId) {
      loadGrades()
      loadRubric()
    }
  }, [selectedExamId])

  const loadCourses = async () => {
    const result = await getCourses()
    if (result.data) {
      setCourses(result.data)
      if (result.data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(result.data[0].id)
      }
    }
  }

  const loadExams = async () => {
    const result = await getExams()
    if (result.data) {
      const courseExams = result.data.filter((e: any) => e.courseId === selectedCourseId)
      setExams(courseExams)
      if (courseExams.length > 0 && !selectedExamId) {
        setSelectedExamId(courseExams[0].id)
      }
    }
  }

  const loadStudents = async () => {
    const result = await getStudents(selectedCourseId)
    if (result.data) {
      setStudents(result.data)
    }
  }

  const loadGrades = async () => {
    setLoading(true)
    const result = await getGrades(selectedExamId)
    if (result.data) {
      setGrades(result.data)
    }
    setLoading(false)
  }

  const loadRubric = async () => {
    const result = await getGradingRubric(selectedExamId)
    if (result.data) {
      setRubric(result.data)
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await createStudent({
      ...studentForm,
      courseId: selectedCourseId,
    })
    if (result.data) {
      setStudentForm({ name: '', email: '', studentCode: '' })
      setStudentDialogOpen(false)
      loadStudents()
    }
  }

  const handleSaveRubric = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const rubricData = JSON.parse(rubricForm.rubric)
      const pointsData = rubricForm.points ? JSON.parse(rubricForm.points) : undefined

      await upsertGradingRubric({
        examId: selectedExamId,
        name: rubricForm.name,
        rubric: rubricData,
        points: pointsData,
        imageUrl: rubricForm.imageUrl || undefined,
      })

      setRubricDialogOpen(false)
      loadRubric()
    } catch (error) {
      alert('Error en el formato JSON. Debe ser: {"1": "A", "2": "B"}')
    }
  }

  const handleAutoGrade = async () => {
    setLoading(true)
    try {
      const rubricData = rubric ? rubric.rubric : JSON.parse(gradingForm.rubric)
      const pointsData = rubric ? rubric.points : JSON.parse(gradingForm.points)

      const response = await fetch('/api/ai/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: gradingForm.imageUrl,
          rubric: rubricData,
          points: pointsData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Buscar el alumno correspondiente (asumo que es el único alumno por ahora)
        const student = students[0]
        if (student) {
          await upsertGrade({
            examId: selectedExamId,
            studentId: student.id,
            score: result.totalScore,
            grade: result.grade,
            status: 'auto_graded',
            answersUrl: gradingForm.imageUrl,
            answersData: result.answers,
          })
          loadGrades()
        }
        setGradeDialogOpen(false)
        alert(`Corrección completada!\n\nPuntaje: ${result.totalScore}/${result.maxScore}\nNota: ${result.grade}`)
      } else {
        alert('Error en la corrección: ' + result.error)
      }
    } catch (error) {
      alert('Error al procesar la corrección')
    }
    setLoading(false)
  }

  const selectedCourse = courses.find((c) => c.id === selectedCourseId)
  const selectedExam = exams.find((e) => e.id === selectedExamId)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Notas y Corrección
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gestiona notas y corrige exámenes con IA
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label>Curso</Label>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Selecciona un curso" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: course.color || '#3b82f6' }} />
                    {course.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label>Examen</Label>
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Selecciona un examen" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setStudentDialogOpen(true)}
          disabled={!selectedCourseId}
          className="h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
        >
          <Users className="mr-2 h-4 w-4" />
          Agregar Alumno
        </Button>

        <Button
          onClick={() => setRubricDialogOpen(true)}
          disabled={!selectedExamId}
          className="h-11 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
        >
          <FileText className="mr-2 h-4 w-4" />
          Pauta
        </Button>
      </div>

      {/* Tabla de notas */}
      {selectedExam && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedExam?.title}</CardTitle>
                <CardDescription>
                  {students.length} {students.length === 1 ? 'alumno' : 'alumnos'} • {rubric ? 'Pauta configurada' : 'Sin pauta configurada'}
                </CardDescription>
              </div>
              <Button
                onClick={() => setGradeDialogOpen(true)}
                className="rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
              >
                <Camera className="mr-2 h-4 w-4" />
                Corregir con IA
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay alumnos en este curso</p>
                <Button
                  onClick={() => setStudentDialogOpen(true)}
                  className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white"
                >
                  Agregar primer alumno
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Puntaje</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const grade = grades.find((g) => g.studentId === student.id)
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          {grade ? `${grade.score} pts` : '-'}
                        </TableCell>
                        <TableCell>
                          {grade?.grade ? grade.grade.toFixed(1) : '-'}
                        </TableCell>
                        <TableCell>
                          {grade?.status === 'auto_graded' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              IA
                            </span>
                          )}
                          {grade?.status === 'graded' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Manual
                            </span>
                          )}
                          {!grade?.status && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              Pendiente
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedGrade({ student, grade })
                              setGradeDialogOpen(true)
                            }}
                            className="rounded-lg"
                          >
                            {grade ? <Eye className="h-4 w-4" : <CheckSquare className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog: Agregar Alumno */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Alumno</DialogTitle>
            <DialogDescription>
              Agrega un nuevo alumno al curso
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="studentCode">Código / RUT</Label>
              <Input
                id="studentCode"
                value={studentForm.studentCode}
                onChange={(e) => setStudentForm({ ...studentForm, studentCode: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStudentDialogOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
                Agregar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Configurar Pauta */}
      <Dialog open={rubricDialogOpen} onOpenChange={setRubricDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Pauta de Corrección</DialogTitle>
            <DialogDescription>
              Define las respuestas correctas para cada pregunta
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRubric} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre de la pauta *</Label>
              <Input
                id="name"
                value={rubricForm.name}
                onChange={(e) => setRubricForm({ ...rubricForm, name: e.target.value })}
                placeholder="Ej: Pauta Certamen 1"
                required
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="rubric">Respuestas correctas (JSON) *</Label>
              <p className="text-xs text-slate-500 mb-2">
                Formato: {`{"1": "A", "2": "B", "3": "C"}`}
              </p>
              <textarea
                id="rubric"
                value={rubricForm.rubric}
                onChange={(e) => setRubricForm({ ...rubricForm, rubric: e.target.value })}
                placeholder='{"1": "A", "2": "B", "3": "C"}'
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono"
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="points">Puntaje por pregunta (JSON, opcional)</Label>
              <p className="text-xs text-slate-500 mb-2">
                Formato: {`{"1": 2, "2": 2, "3": 1}`}
              </p>
              <textarea
                id="points"
                value={rubricForm.points}
                onChange={(e) => setRubricForm({ ...rubricForm, points: e.target.value })}
                placeholder='{"1": 2, "2": 2, "3": 1}'
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">URL de imagen de la pauta (opcional)</Label>
              <Input
                id="imageUrl"
                value={rubricForm.imageUrl}
                onChange={(e) => setRubricForm({ ...rubricForm, imageUrl: e.target.value })}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRubricDialogOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                Guardar Pauta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Corregir con IA */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Corrección Automática con IA</DialogTitle>
            <DialogDescription>
              Sube una imagen del examen para corregir automáticamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {rubric ? (
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800">
                <p className="text-sm font-medium mb-2">Pauta actual:</p>
                <pre className="text-xs overflow-auto p-2 rounded bg-white dark:bg-slate-900">
                  {JSON.stringify(rubric.rubric, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ No hay pauta configurada. Debes configurar la pauta primero.
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="imageUrl">URL de la imagen del examen *</Label>
              <Input
                id="imageUrl"
                value={gradingForm.imageUrl}
                onChange={(e) => setGradingForm({ ...gradingForm, imageUrl: e.target.value })}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setGradeDialogOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button
                onClick={handleAutoGrade}
                disabled={loading || !rubric || !gradingForm.imageUrl}
                className="rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white"
              >
                {loading ? 'Procesando...' : 'Corregir con IA'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
