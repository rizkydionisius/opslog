
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  const password = await bcrypt.hash('password123', 10)

  // 1. Create Demo User
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: password,
      categories: {
        create: [
          { name: 'Work' },
          { name: 'Personal' },
          { name: 'Learning' },
          { name: 'Health' },
        ],
      },
    },
  })

  console.log({ user })

  // 2. Create a Log Entry for the user
  // We need to fetch the category ID first
  const workCategory = await prisma.category.findFirst({
    where: { 
        userId: user.id,
        name: 'Work' 
    }
  })

  if (workCategory) {
      const log = await prisma.logEntry.create({
        data: {
          title: 'Project Setup',
          description: 'Initial setup of the OpsLog project with Next.js, Prisma, and PostgreSQL',
          date: new Date(),
          status: 'Selesai',
          userId: user.id,
          categoryId: workCategory.id
        }
      })
      console.log({ log })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
