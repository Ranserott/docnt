/**
 * Página de Cursos
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus } from 'lucide-react'

export default function CoursesPage() {
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
        <Button className="h-11 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Curso
        </Button>
      </div>

      {/* Lista de cursos vacía */}
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
          <Button className="h-11 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
            <Plus className="mr-2 h-4 w-4" />
            Crear Curso
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
