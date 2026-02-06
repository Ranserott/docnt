/**
 * Página de Notas y Corrección de Exámenes con Visión
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, CheckSquare, Camera, Save, Users, FileText, Upload, Eye, Image as ImageIcon, X } from 'lucide-react'
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
  const [rubricForm, setRubricForm] = useState({ name: '', rubric: '{}', points: '{}', imageUrl: '', imageFile: null as File | null })
  const [gradingForm, setGradingForm] = useState({ imageUrl: '', rubric: '{}', points: '{}', imageFile: null as File | null })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const rubricFileInputRef = useRef<HTMLInputElement>(null)

  // Subir imagen y obtener URL
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Error al subir la imagen')
    }

    const data = await response.json()
    return data.url
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setGradingForm({ ...gradingForm, imageFile: file })

    try {
      setLoading(true)
      const url = await uploadImage(file)
      setGradingForm({ ...gradingForm, imageUrl: url, imageFile: file })
    } catch (error) {
      alert('Error al subir la imagen')
    } finally {
      setLoading(false)
    }
  }

  const handleRubricFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setRubricForm({ ...rubricForm, imageFile: file })

    try {
      setLoading(true)
      const url = await uploadImage(file)
      setRubricForm({ ...rubricForm, imageUrl: url, imageFile: file })
    } catch (error) {
      alert('Error al subir la imagen')
    } finally {
      setLoading(false)
    }
  }

  const handleCameraCapture = async () => {
    fileInputRef.current?.click()
  }

  const handleRubricCameraCapture = async () => {
    rubricFileInputRef.current?.click()
  }

  const clearImage = () => {
    setGradingForm({ ...gradingForm, imageUrl: '', imageFile: null })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const clearRubricImage = () => {
    setRubricForm({ ...rubricForm, imageUrl: '', imageFile: null })
    if (rubricFileInputRef.current) {
      rubricFileInputRef.current.value = ''
    }
  }

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
      // Si hay un archivo sin subir, subirlo primero
      let imageUrl = rubricForm.imageUrl
      if (rubricForm.imageFile && !imageUrl) {
        imageUrl = await uploadImage(rubricForm.imageFile)
        setRubricForm({ ...rubricForm, imageUrl })
      }

      const rubricData = JSON.parse(rubricForm.rubric)
      const pointsData = rubricForm.points ? JSON.parse(rubricForm.points) : undefined

      await upsertGradingRubric({
        examId: selectedExamId,
        name: rubricForm.name,
        rubric: rubricData,
        points: pointsData,
        imageUrl: imageUrl || undefined,
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
      // Si hay un archivo sin subir, subirlo primero
      let imageUrl = gradingForm.imageUrl
      if (gradingForm.imageFile && !imageUrl) {
        imageUrl = await uploadImage(gradingForm.imageFile)
        setGradingForm({ ...gradingForm, imageUrl })
      }

      if (!imageUrl) {
        alert('Por favor selecciona o toma una foto del examen')
        setLoading(false)
        return
      }

      const rubricData = rubric ? rubric.rubric : JSON.parse(gradingForm.rubric)
      const pointsData = rubric ? rubric.points : JSON.parse(gradingForm.points)

      const response = await fetch('/api/ai/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageUrl,
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
            answersUrl: imageUrl,
            answersData: result.answers,
          })
          loadGrades()
        }
        setGradeDialogOpen(false)
        clearImage()
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
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
        <div className="flex-1 min-w-[200px]">
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

        <div className="flex-1 min-w-[200px]">
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

        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={() => setStudentDialogOpen(true)}
            disabled={!selectedCourseId}
            className="flex-1 sm:flex-none h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
          >
            <Users className="mr-2 h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Agregar</span>
            <span className="sm:hidden">Alumno</span>
          </Button>

          <Button
            onClick={() => setRubricDialogOpen(true)}
            disabled={!selectedExamId}
            className="flex-1 sm:flex-none h-11 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            <FileText className="mr-2 h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Pauta</span>
          </Button>
        </div>
      </div>

      {/* Tabla de notas */}
      {selectedExam && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl lg:text-2xl">{selectedExam?.title}</CardTitle>
                <CardDescription>
                  {students.length} {students.length === 1 ? 'alumno' : 'alumnos'} • {rubric ? 'Pauta configurada' : 'Sin pauta configurada'}
                </CardDescription>
              </div>
              <Button
                onClick={() => setGradeDialogOpen(true)}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
              >
                <Camera className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Corregir con IA</span>
                <span className="sm:hidden">Corregir</span>
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
              <div className="overflow-x-auto -mx-4 lg:mx-0">
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
                              {grade ? <Eye className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog: Agregar Alumno */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="max-w-md w-[95vw]">
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
      <Dialog open={rubricDialogOpen} onOpenChange={(open) => {
        setRubricDialogOpen(open)
        if (!open) clearRubricImage()
      }}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
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

            {/* Upload de imagen de la pauta */}
            <div>
              <Label>Imagen de la pauta (opcional)</Label>
              <input
                ref={rubricFileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleRubricFileSelect}
                className="hidden"
                id="rubric-image-input"
              />

              {rubricForm.imageUrl ? (
                <div className="relative mt-2">
                  <img
                    src={rubricForm.imageUrl}
                    alt="Pauta"
                    className="w-full h-auto rounded-xl border border-slate-200 dark:border-slate-800"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={clearRubricImage}
                    className="absolute top-2 right-2 rounded-full shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => rubricFileInputRef.current?.click()}
                    className="h-24 rounded-xl flex flex-col gap-2 border-dashed"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Subir archivo</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRubricCameraCapture}
                    className="h-24 rounded-xl flex flex-col gap-2 border-dashed"
                  >
                    <Camera className="h-6 w-6" />
                    <span className="text-sm">Tomar foto</span>
                  </Button>
                </div>
              )}

              {rubricForm.imageFile && !rubricForm.imageUrl && (
                <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    {rubricForm.imageFile.name}
                  </span>
                </div>
              )}
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
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Corrección Automática con IA</DialogTitle>
            <DialogDescription>
              Sube o toma una foto del examen para corregir automáticamente
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

            {/* Upload de imagen */}
            <div>
              <Label>Imagen del examen *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
                id="exam-image-input"
              />

              {gradingForm.imageUrl ? (
                <div className="relative mt-2">
                  <img
                    src={gradingForm.imageUrl}
                    alt="Examen"
                    className="w-full h-auto rounded-xl border border-slate-200 dark:border-slate-800"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={clearImage}
                    className="absolute top-2 right-2 rounded-full shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24 rounded-xl flex flex-col gap-2 border-dashed"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Subir archivo</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCameraCapture}
                    className="h-24 rounded-xl flex flex-col gap-2 border-dashed"
                  >
                    <Camera className="h-6 w-6" />
                    <span className="text-sm">Tomar foto</span>
                  </Button>
                </div>
              )}

              {gradingForm.imageFile && !gradingForm.imageUrl && (
                <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    {gradingForm.imageFile.name}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setGradeDialogOpen(false); clearImage() }} className="rounded-xl">
                Cancelar
              </Button>
              <Button
                onClick={handleAutoGrade}
                disabled={loading || !rubric || (!gradingForm.imageUrl && !gradingForm.imageFile)}
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
