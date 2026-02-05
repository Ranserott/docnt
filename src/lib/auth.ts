/**
 * Sistema de autenticación simplificado con JWT en cookies
 */

import { cookies } from 'next/headers'
import { prisma } from '@/lib/db/prisma'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-this'
)

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: string
}

export async function auth() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value

  if (!sessionToken) {
    return null
  }

  try {
    const { payload } = await jwtVerify(sessionToken, SECRET)
    return {
      user: {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.name as string | null,
        role: payload.role as string,
      }
    } as { user: SessionUser }
  } catch (error) {
    return null
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  return session?.user || null
}
