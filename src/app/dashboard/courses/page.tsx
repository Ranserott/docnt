/**
 * Página de Cursos
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BookOpen, Plus, Users, Trash2, X } from 'lucide-react'
import { CourseDialog } from '@/components/courses/course-dialog'
import { getCourses } from '@/lib/actions/course.actions'
import { getStudents, createStudent, deleteStudent } from '@/lib/actions/student.actions'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

export default function CoursesPage() {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [studentForm, setStudentForm] = useState({ name: '', email: '', studentCode: '' })

  const loadCourses = async () => {
    setLoading(true)
    const result = await getCourses()
    if (result.data) {
      setCourses(result.data)
    }
    setLoading(false)
  }

  const loadStudents = async (courseId: string) => {
    const result = await getStudents(courseId)
    if (result.data) {
      setStudents(result.data)
    }
  }

  const handleOpenStudents = (course: any) => {
    setSelectedCourse(course)
    loadStudents(course.id)
    setStudentDialogOpen(true)
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentForm.name.trim()) {
      alert('El nombre es obligatorio')
      return
    }
    const result = await createStudent({
      ...studentForm,
      courseId: selectedCourse.id,
    })
    if (result.data) {
      setStudentForm({ name: '', email: '', studentCode: '' })
      loadStudents(selectedCourse.id)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (confirm('¿Estás seguro de eliminar este alumno?')) {
      await deleteStudent(studentId)
      loadStudents(selectedCourse.id)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Cursos
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gestiona tus cursos y secciones
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-11 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Curso
        </Button>
      </div>

      {/* Lista de cursos */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">Cargando cursos...</p>
        </div>
      ) : courses.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl shadow-purple-500/30">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">No hay cursos</CardTitle>
                <CardDescription className="text-base">
                  Comienza creando tu primer curso
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setDialogOpen(true)}
              className="h-11 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Curso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow cursor-pointer"
              style={{
                borderTop: `4px solid ${course.color || '#3b82f6'}`,
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{course.name}</CardTitle>
                    {course.code && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {course.code}
                      </p>
                    )}
                  </div>
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: course.color || '#3b82f6' }}
                  >
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
                <CardDescription>
                  {course.period}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{course._count?.sections || 0}</span>
                    <span>secciones</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{course._count?.events || 0}</span>
                    <span>eventos</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenStudents(course)}
                  className="w-full mt-3 rounded-lg"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Ver Alumnos
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de crear curso */}
      <CourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCourseCreated={loadCourses}
      />

      {/* Diálogo de gestión de alumnos */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Alumnos - {selectedCourse?.name}</DialogTitle>
            <DialogDescription>
              Gestiona los alumnos de este curso. Los alumnos aquí aparecerán automáticamente en el módulo de notas.
            </DialogDescription>
          </DialogHeader>

          {/* Formulario para agregar alumno */}
          <form onSubmit={handleCreateStudent} className="space-y-4 mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
            <h3 className="font-semibold text-sm">Agregar Nuevo Alumno</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="student-name">Nombre *</Label>
                <Input
                  id="student-name"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="Nombre completo"
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="student-email">Email</Label>
                <Input
                  id="student-email"
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="email@ejemplo.com"
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="student-code">RUT / Código</Label>
                <Input
                  id="student-code"
                  value={studentForm.studentCode}
                  onChange={(e) => setStudentForm({ ...studentForm, studentCode: e.target.value })}
                  placeholder="12.345.678-9"
                  className="rounded-xl"
                />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Alumno
            </Button>
          </form>

          {/* Lista de alumnos */}
          {students.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay alumnos en este curso</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>RUT / Código</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email || '-'}</TableCell>
                      <TableCell>{student.studentCode || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                          className="h-8 w-8 p-0 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
