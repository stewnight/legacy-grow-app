import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export const saltAndHashPassword = async (
  password: string
): Promise<string> => {
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  // Encode password + salt
  const encoder = new TextEncoder()
  const data = encoder.encode(password + saltHex)

  // Hash using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return `${saltHex}:${hashHex}`
}

export const verifyPassword = async (
  storedHash: string,
  password: string
): Promise<boolean> => {
  const [salt, hash] = storedHash.split(':')

  // Encode password + salt
  const encoder = new TextEncoder()
  const data = encoder.encode(password + salt)

  // Hash using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return hash === hashHex
}

export const getUserFromDb = async (email: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  })
  return user
}

export const isFirstUser = async (): Promise<boolean> => {
  const userCount = await db.select().from(users)
  return userCount.length === 0
}

export const createUser = async (
  email: string,
  password: string,
  role: 'user' | 'admin' = 'user'
) => {
  const hashedPassword = await saltAndHashPassword(password)

  const [user] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      role,
    })
    .returning()

  return user
}
