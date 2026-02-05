/**
 * Página de Archivos
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Files } from 'lucide-react'

export default function FilesPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Archivos
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus documentos y recursos
          </p>
        </div>
        <Button className="h-11 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50">
          <Plus className="mr-2 h-4 w-4" />
          Subir Archivo
        </Button>
      </div>

      {/* Lista de archivos vacía */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/30">
              <Files className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>No hay archivos</CardTitle>
              <CardDescription>
                Sube tus primeros archivos y documentos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button className="rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50">
            <Plus className="mr-2 h-4 w-4" />
            Subir Archivo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
