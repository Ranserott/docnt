/**
 * Página de Configuración
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Configuración
        </h1>
        <p className="text-muted-foreground">
          Administra tu cuenta y preferencias
        </p>
      </div>

      {/* Opciones de configuración */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                <SettingsIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>
                  Actualiza tu información personal
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="rounded-xl">
              Editar perfil
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                <SettingsIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>
                  Configura tus preferencias de alertas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="rounded-xl">
              Configurar
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                <SettingsIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Seguridad</CardTitle>
                <CardDescription>
                  Cambia tu contraseña y configuración de seguridad
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="rounded-xl">
              Administrar
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
                <SettingsIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Apariencia</CardTitle>
                <CardDescription>
                  Personaliza el tema y visualización
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="rounded-xl">
              Personalizar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
