'use server'

import { auth } from "@/auth" // Assumed location for NextAuth helper
import { prisma } from "@/lib/prisma" // Assumed location for Prisma client instance
import { revalidatePath } from "next/cache"
import { z } from "zod"

// MOCK USER ID for development bypass
const MOCK_USER_ID = "dev-user-id"

async function getSessionUser() {
  const session = await auth()
  if (session?.user?.id) {
    return session.user.id
  }
  // Fallback for development
  return MOCK_USER_ID
}

// Types
export type DashboardStats = {
  currentStreak: number
  totalLogsThisMonth: number
  recentActivity: LogEntryWithCategory[]
}

// Determine if we are using exact match for date or range. 
// For streak, we need strict daily checks.

type LogEntryWithCategory = {
  id: string
  title: string
  date: Date
  category: { name: string }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const userId = await getSessionUser()
  const now = new Date()

  // 1. Total Logs This Month
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const totalLogsThisMonth = await prisma.logEntry.count({
    where: {
      userId,
      date: {
        gte: firstDayOfMonth,
        lt: nextMonth,
      },
    },
  })

  // 2. Calculate Streak
  // Fetch only necessary fields for efficiency: date only, distinct dates
  const logs = await prisma.logEntry.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: 'desc' },
  })

  // Simplify to YYYY-MM-DD strings to remove time component and handle duplicates
  const uniqueDates = Array.from(new Set(logs.map(log => log.date.toISOString().split('T')[0]))).sort().reverse()

  // Current date (check if acted today or yesterday to continue streak)
  const todayStr = now.toISOString().split('T')[0]
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let currentStreak = 0
  let streakActive = false

  // If latest log is today or yesterday, streak is alive
  if (uniqueDates.length > 0) {
    if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
      streakActive = true
    }
  }

  if (streakActive) {
    // Count backward
    // If the most recent is today, start counting. If yesterday, start counting.
    // We basically need to check continuity.
    // Check consecutive days.

    // We already have sorted reverse list.
    // We just need to check if uniqueDates[i] is 1 day before uniqueDates[i-1] (or today/yesterday for start)

    // Helper to get day difference
    const getDaysDiff = (d1: string, d2: string) => {
      const date1 = new Date(d1).getTime();
      const date2 = new Date(d2).getTime();
      // round to nearest day
      return Math.round((date1 - date2) / (1000 * 60 * 60 * 24));
    }

    // Anchor: Start checking from today using the list
    let lastCheckedDate = new Date().toISOString().split('T')[0];

    // Slight adjustment logic: 
    // If the user hasn't logged TODAY yet, but did YESTERDAY, streak is X. 
    // If they logged TODAY, streak is X.
    // So we iterate the user's logs.

    for (let i = 0; i < uniqueDates.length; i++) {
      const logDate = uniqueDates[i];
      const diff = getDaysDiff(lastCheckedDate, logDate);

      if (i === 0) {
        // First log encountered. 
        // If it's today (diff=0), good.
        // If it's yesterday (diff=1), good.
        // If it's older (diff > 1), streak is broken/0 (but we handled streakActive check above, so maybe just 0 logic here)
        if (diff <= 1) {
          currentStreak++;
          lastCheckedDate = logDate;
        } else {
          break;
        }
      } else {
        // Subsequent logs. Must be exactly 1 day diff from previous log
        const gap = getDaysDiff(lastCheckedDate, logDate);
        if (gap === 1) {
          currentStreak++;
          lastCheckedDate = logDate;
        } else {
          break;
        }
      }
    }
  }

  // 3. Recent Activity (Sidebar/Quick view)
  const recentActivity = await prisma.logEntry.findMany({
    where: { userId },
    take: 5,
    orderBy: { date: 'desc' },
    select: {
      id: true,
      title: true,
      date: true,
      category: { select: { name: true } }
    }
  })

  return {
    currentStreak,
    totalLogsThisMonth,
    recentActivity
  }
}

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
})

export async function upsertCategory(name: string) {
  const userId = await getSessionUser()

  const validated = CategorySchema.parse({ name })

  // Check if exists
  const existing = await prisma.category.findFirst({
    where: {
      name: { equals: validated.name as string }, // Case insensitive not supported in SQLite
      userId
    }
  })

  if (existing) {
    return existing
  }

  const newCategory = await prisma.category.create({
    data: {
      name: validated.name,
      userId
    }
  })

  revalidatePath('/dashboard') // Revalidate where categories are used (dashboard form)
  return newCategory
}

const LogEntrySchema = z.object({
  title: z.string().min(1),
  description: z.string().or(z.literal('')),
  date: z.date(),
  categoryId: z.string().min(1),
  imageUrl: z.string().optional().nullable(),
})

export async function createLogEntry(data: z.infer<typeof LogEntrySchema>) {
  const userId = await getSessionUser()

  const validated = LogEntrySchema.parse(data)

  await prisma.logEntry.create({
    data: {
      ...validated,
      userId
    }
  })

  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  return { success: true }
}

// Placeholder for file upload
export async function uploadFilePlaceholder(formData: FormData) {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500))
  // Return a fake URL
  const file = formData.get('file') as File
  console.log("Uploaded fake file:", file.name)
  return "https://placehold.co/600x400?text=Uploaded+Image"
}
