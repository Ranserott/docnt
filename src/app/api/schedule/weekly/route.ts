/**
 * API Route para obtener eventos semanales
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getWeeklyEvents } from '@/lib/actions/schedule.actions'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { weekStart } = body

    if (!weekStart) {
      return NextResponse.json({ error: 'weekStart es requerido' }, { status: 400 })
    }

    const result = await getWeeklyEvents(new Date(weekStart))

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ events: result.data })
  } catch (error) {
    console.error('Error al obtener eventos semanales:', error)
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 })
  }
}
