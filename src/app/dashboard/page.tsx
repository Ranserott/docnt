/**
 * Página principal del Dashboard
 */

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Calendar, GraduationCap } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido a tu sistema de gestión docente
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cursos Activos
            </CardTitle>
            <div className="rounded-lg p-2 bg-blue-500/10">
              <BookOpen className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Secciones
            </CardTitle>
            <div className="rounded-lg p-2 bg-green-500/10">
              <Calendar className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Certámenes
            </CardTitle>
            <div className="rounded-lg p-2 bg-purple-500/10">
              <GraduationCap className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próximos Eventos
            </CardTitle>
            <div className="rounded-lg p-2 bg-orange-500/10">
              <Calendar className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Mensaje de bienvenida */}
      <Card>
        <CardHeader>
          <CardTitle>Comienza a usar DOCNT</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Crea tu primer curso para empezar a organizar tu docencia.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
