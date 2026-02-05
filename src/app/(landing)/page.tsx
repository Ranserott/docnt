/**
 * Página de bienvenida - Landing page de DOCNT
 */

import Link from 'next/link'
import { GraduationCap, BookOpen, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex items-center justify-center mb-16">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold">DOCNT</h1>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Sistema de Gestión Docente
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Planifica clases, organiza calendarios y genera certámenes con la plataforma completa para docentes.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Calendario</CardTitle>
              <CardDescription>
                Planifica tus clases y eventos con vista mensual y semanal
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Cursos</CardTitle>
              <CardDescription>
                Organiza tus cursos por periodos con secciones y horarios
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Certámenes</CardTitle>
              <CardDescription>
                Genera evaluaciones con banco de preguntas y versiones
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Ir al Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
