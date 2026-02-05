/**
 * Página de Calendario
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'

export default function CalendarPage() {
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Calendario
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Planifica y organiza tus clases y eventos
          </p>
        </div>
        <Button className="h-11 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      {/* Vista de calendario */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30">
                <CalendarIcon className="h-5 w-5" />
              </div>
              {format(today, 'MMMM yyyy', { locale: es })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Grid del calendario */}
          <div className="grid grid-cols-7 gap-2">
            {/* Encabezados de días */}
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">
                {day}
              </div>
            ))}

            {/* Días del mes */}
            {days.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const isToday = day.toDateString() === today.toDateString()

              return (
                <div
                  key={dateKey}
                  className={`min-h-28 rounded-xl border-2 p-3 transition-all duration-200 hover:shadow-lg ${
                    isToday
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100/50 shadow-md dark:from-green-950/50 dark:to-green-900/20'
                      : 'border-slate-200 bg-white hover:border-green-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-green-700'
                  }`}
                >
                  <div className={`text-lg font-bold ${
                    isToday ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {format(day, 'd')}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
