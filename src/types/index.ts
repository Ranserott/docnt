/**
 * Tipos principales del sistema DOCNT
 * Estos tipos extienden los tipos generados por Prisma
 */

import { EventType, QuestionType, Difficulty, Role } from '@prisma/client'

// ==================== USUARIOS ====================

export type UserRole = Role

export interface UserWithRelations {
  id: string
  name: string | null
  email: string
  image: string | null
  role: UserRole
  createdAt: Date
  _count?: {
    courses: number
    events: number
    exams: number
  }
}

// ==================== CURSOS Y SECCIONES ====================

export interface CourseListItem {
  id: string
  name: string
  code: string | null
  period: string
  color: string | null
  description: string | null
  _count?: {
    sections: number
    events: number
    exams: number
  }
}

export interface CourseDetail extends CourseListItem {
  sections: SectionListItem[]
  events: EventListItem[]
  createdAt: Date
  updatedAt: Date
}

export interface SectionListItem {
  id: string
  name: string
  room: string | null
  schedule: ScheduleItem[] | null
  active: boolean
  _count?: {
    events: number
  }
}

export type ScheduleItem = {
  day: string // 'Lunes', 'Martes', etc.
  start: string // '08:30'
  end: string // '10:00'
}

// ==================== CALENDARIO ====================

export type EventTypeValue = EventType

export interface EventListItem {
  id: string
  title: string
  type: EventTypeValue
  startDate: Date
  endDate: Date | null
  allDay: boolean
  location: string | null
  status: string
  course: {
    id: string
    name: string
    color: string | null
  } | null
  section: {
    id: string
    name: string
  } | null
  tags: TagItem[]
}

export interface EventDetail extends EventListItem {
  description: string | null
  notes: string | null
  observations: string | null
  userId: string
  courseId: string | null
  sectionId: string | null
  createdAt: Date
  updatedAt: Date
  files: FileItem[]
}

export interface EventFormData {
  title: string
  description?: string
  type: EventTypeValue
  startDate: Date
  endDate?: Date
  allDay: boolean
  location?: string
  notes?: string
  courseId?: string
  sectionId?: string
  tagIds?: string[]
}

// ==================== ETIQUETAS ====================

export interface TagItem {
  id: string
  name: string
  color: string | null
}

// ==================== ARCHIVOS ====================

export interface FileItem {
  id: string
  name: string
  filename: string
  mimeType: string
  size: number
  url: string
  description: string | null
  content: string | null
  version: number
  createdAt: Date
}

export interface FileFormData {
  name: string
  description?: string
  content?: string
  courseId?: string
}

// ==================== EXÁMENES Y PREGUNTAS ====================

export type QuestionTypeValue = QuestionType
export type DifficultyValue = Difficulty

export interface QuestionListItem {
  id: string
  content: string
  type: QuestionTypeValue
  difficulty: DifficultyValue
  unit: string | null
  points: number
  tags: string[]
  active: boolean
}

export interface QuestionDetail extends QuestionListItem {
  options: string[] | null
  correctAnswer: string | null
  createdAt: Date
  updatedAt: Date
}

export interface QuestionFormData {
  content: string
  type: QuestionTypeValue
  difficulty: DifficultyValue
  unit?: string
  points?: number
  options?: string[]
  correctAnswer?: string
  tags?: string[]
}

export interface ExamListItem {
  id: string
  title: string
  date: Date | null
  duration: number | null
  totalPoints: number
  course: {
    id: string
    name: string
  }
  _count?: {
    questions: number
  }
}

export interface ExamDetail extends ExamListItem {
  description: string | null
  allowRandom: boolean
  showResults: boolean
  questions: ExamQuestionItem[]
  createdAt: Date
  updatedAt: Date
}

export interface ExamQuestionItem {
  id: string
  order: number
  points: number
  question: QuestionListItem
}

export interface ExamFormData {
  title: string
  description?: string
  date?: Date
  duration?: number
  allowRandom?: boolean
  showResults?: boolean
  courseId: string
  questionIds?: string[] // Array de { questionId, points }
}

// ==================== DASHBOARD ====================

export interface DashboardStats {
  totalCourses: number
  totalEvents: number
  upcomingEvents: number
  totalExams: number
  totalQuestions: number
}

export interface UpcomingEvent {
  id: string
  title: string
  type: EventTypeValue
  startDate: Date
  course: {
    name: string
    color: string | null
  } | null
}
