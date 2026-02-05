/**
 * Página de Cursos
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Plus } from 'lucide-react'
import Link from 'next/link'

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
          <p className="text-muted-foreground">
            Gestiona tus cursos y secciones
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Curso
        </Button>
      </div>

      {/* Lista de cursos vacía */}
      <Card>
        <CardHeader>
          <CardTitle>No hay cursos</CardTitle>
          <CardDescription>
            Comienza creando tu primer curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Crear Curso
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
