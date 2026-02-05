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
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">
            Planifica y organiza tus clases y eventos
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      {/* Vista de calendario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(today, 'MMMM yyyy', { locale: es })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
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
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
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
                  className={`min-h-24 rounded-lg border p-2 transition-colors hover:bg-accent ${
                    isToday ? 'border-primary' : ''
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    isToday ? 'text-primary' : 'text-muted-foreground'
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
