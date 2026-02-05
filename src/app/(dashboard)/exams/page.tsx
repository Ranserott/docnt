/**
 * Página de Certámenes
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileQuestion } from 'lucide-react'

export default function ExamsPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Certámenes
          </h1>
          <p className="text-muted-foreground">
            Genera y gestiona tus evaluaciones
          </p>
        </div>
        <Button className="h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Certamen
        </Button>
      </div>

      {/* Lista de certámenes vacía */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30">
              <FileQuestion className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>No hay certámenes</CardTitle>
              <CardDescription>
                Comienza creando tu primer certamen
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50">
            <Plus className="mr-2 h-4 w-4" />
            Crear Certamen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
