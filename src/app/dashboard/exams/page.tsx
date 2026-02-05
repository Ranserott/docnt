/**
 * Página de Certámenes
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileQuestion, GraduationCap, Calendar, Clock, Trash2, Edit, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())

  const loadData = async () => {
    setLoading(true)
    const [examsResult, coursesResult] = await Promise.all([
      getExams(),
      getCourses(),
    ])
    if (examsResult.data) setExams(examsResult.data)
    if (coursesResult.data) {
      setCourses(coursesResult.data)
      // Expand todos los cursos por defecto
      setExpandedCourses(new Set(coursesResult.data.map((c: any) => c.id)))
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses)
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId)
    } else {
      newExpanded.add(courseId)
    }
    setExpandedCourses(newExpanded)
  }

  const handleDeleteExam = async (examId: string) => {
    if (confirm('¿Estás seguro de eliminar este certamen?')) {
      await deleteExam(examId)
      setExams(exams.filter((e) => e.id !== examId))
    }
  }

  // Agrupar exámenes por curso
  const examsByCourse = courses.reduce((acc: any, course: any) => {
    acc[course.id] = {
      course,
      exams: exams.filter((e) => e.courseId === course.id),
    }
    return acc
  }, {})

  // Exámenes sin curso (no debería pasar, pero por seguridad)
  const examsWithoutCourse = exams.filter((e) => !e.courseId)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Certámenes
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Genera y gestiona tus evaluaciones por curso
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

      {/* Lista de certámenes agrupados por curso */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">Cargando certámenes...</p>
        </div>
      ) : courses.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/30">
                <FileQuestion className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">No hay cursos</CardTitle>
                <CardDescription className="text-base">
                  Primero crea un curso para poder agregar certámenes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                window.location.href = '/dashboard/courses'
              }}
              className="h-11 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
            >
              Ir a Cursos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => {
            const courseData = examsByCourse[course.id] || { exams: [] }
            const isExpanded = expandedCourses.has(course.id)

            return (
              <Card
                key={course.id}
                className="border-slate-200 dark:border-slate-800 overflow-hidden"
                style={{
                  borderTop: `4px solid ${course.color || '#f97316'}`,
                }}
              >
                {/* Header del curso - colapsable */}
                <button
                  onClick={() => toggleCourse(course.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                      style={{ backgroundColor: course.color || '#f97316' }}
                    >
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {course.name}
                        {course.code && (
                          <span className="ml-2 text-sm font-normal text-slate-600 dark:text-slate-400">
                            ({course.code})
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {courseData.exams.length} {courseData.exams.length === 1 ? 'certamen' : 'certámenes'}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </button>

                {/* Lista de certámenes del curso */}
                {isExpanded && (
                  <div className="px-6 pb-6">
                    {courseData.exams.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <FileQuestion className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No hay certámenes en este curso</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {courseData.exams.map((exam: any) => (
                          <Card
                            key={exam.id}
                            className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-base">{exam.title}</CardTitle>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {/* TODO: Editar */}}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                    title="Editar"
                                  >
                                    <Edit className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteExam(exam.id)}
                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/50 rounded"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                                  </button>
                                </div>
                              </div>
                              {exam.description && (
                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                                  {exam.description}
                                </p>
                              )}
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {/* Detalles */}
                              <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
                                {exam.date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{format(new Date(exam.date), 'd MMM', { locale: es })}</span>
                                  </div>
                                )}
                                {exam.duration && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{exam.duration} min</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <FileQuestion className="h-3 w-3" />
                                  <span>{exam._count?.questions || 0} preg</span>
                                </div>
                                {exam.totalPoints > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="font-semibold">{exam.totalPoints} pts</span>
                                  </div>
                                )}
                              </div>

                              {/* Indicador de evento calendario */}
                              {exam.date && (
                                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                  <Calendar className="h-3 w-3" />
                                  <span>En calendario</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
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
