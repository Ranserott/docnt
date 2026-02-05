/**
 * Página de bienvenida - Landing page de DOCNT
 */

import Link from 'next/link'
import { GraduationCap, BookOpen, Calendar, FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex items-center justify-center mb-16">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 transition-all duration-300 group-hover:shadow-blue-500/50 group-hover:scale-105">
              <GraduationCap className="h-9 w-9" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              DOCNT
            </h1>
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-slate-100">
            Sistema de Gestión Docente
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Planifica clases, organiza calendarios y genera certámenes con la plataforma completa para docentes.
            Todo lo que necesitas en un solo lugar.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          <Card className="border-2 border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 mb-4">
                <Calendar className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl mb-2">Calendario</CardTitle>
              <CardDescription className="text-base">
                Planifica tus clases y eventos con vista mensual y semanal
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 mb-4">
                <BookOpen className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl mb-2">Cursos</CardTitle>
              <CardDescription className="text-base">
                Organiza tus cursos por periodos con secciones y horarios
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 mb-4">
                <FileText className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl mb-2">Certámenes</CardTitle>
              <CardDescription className="text-base">
                Genera evaluaciones con banco de preguntas y versiones
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="h-14 px-8 text-lg rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              Comenzar ahora
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-6 text-slate-600 dark:text-slate-400">
            ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
