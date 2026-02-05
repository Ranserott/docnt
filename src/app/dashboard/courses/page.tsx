/**
 * Página de Cursos
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus } from 'lucide-react'
import { CourseDialog } from '@/components/courses/course-dialog'
import { getCourses } from '@/lib/actions/course.actions'
import { useRouter } from 'next/navigation'

export default function CoursesPage() {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadCourses = async () => {
    setLoading(true)
    const result = await getCourses()
    if (result.data) {
      setCourses(result.data)
    }
    setLoading(false)
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
    </div>
  )
}
