/**
 * Página de Certámenes
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileQuestion, GraduationCap, Calendar, Clock, Trash2, Edit } from 'lucide-react'
import { ExamDialog } from '@/components/exams/exam-dialog'
import { getExams, deleteExam } from '@/lib/actions/exam.actions'
import { getCourses } from '@/lib/actions/course.actions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ExamsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [exams, setExams] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const [examsResult, coursesResult] = await Promise.all([
      getExams(),
      getCourses(),
    ])
    if (examsResult.data) setExams(examsResult.data)
    if (coursesResult.data) setCourses(coursesResult.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDeleteExam = async (examId: string) => {
    if (confirm('¿Estás seguro de eliminar este certamen?')) {
      await deleteExam(examId)
      setExams(exams.filter((e) => e.id !== examId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Certámenes
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Genera y gestiona tus evaluaciones
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Certamen
        </Button>
      </div>

      {/* Lista de certámenes */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">Cargando certámenes...</p>
        </div>
      ) : exams.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/30">
                <FileQuestion className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">No hay certámenes</CardTitle>
                <CardDescription className="text-base">
                  Comienza creando tu primer certamen
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setDialogOpen(true)}
              className="h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Certamen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card
              key={exam.id}
              className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
              style={{
                borderTop: `4px solid ${exam.course?.color || '#f97316'}`,
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{exam.title}</CardTitle>
                    {exam.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {exam.description}
                      </p>
                    )}
                  </div>
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: exam.course?.color || '#f97316' }}
                  >
                    <GraduationCap className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Información del curso */}
                <div className="text-sm">
                  <p className="text-slate-600 dark:text-slate-400">Curso</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {exam.course?.name}
                  </p>
                </div>

                {/* Detalles del certamen */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                  {exam.date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(exam.date), 'd MMM', { locale: es })}</span>
                    </div>
                  )}
                  {exam.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{exam.duration} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <FileQuestion className="h-4 w-4" />
                    <span>{exam._count?.questions || 0} preguntas</span>
                  </div>
                  {exam.totalPoints > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{exam.totalPoints} pts</span>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExam(exam.id)}
                    className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de crear certamen */}
      <ExamDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        courses={courses}
        onExamCreated={loadData}
      />
    </div>
  )
}
