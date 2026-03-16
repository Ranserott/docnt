import { AttendanceModule } from '@/components/attendance/attendance-module'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Asistencia | DOCNT',
  description: 'Gestión de asistencia de cursos',
}

export default function AttendancePage() {
  return (
    <div className="container mx-auto p-6">
      <AttendanceModule />
    </div>
  )
}
