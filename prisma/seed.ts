import "dotenv/config"
import { encryptObject } from "@/lib/encryption"
import { PrismaClient, LLMProvider, DBType, SyncStatus } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run prisma/seed.ts")
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Clean existing seed data ─────────────────────────────────────────────
  await prisma.dashboardWidget.deleteMany()
  await prisma.dashboardPage.deleteMany()
  await prisma.monitoredMetric.deleteMany()
  await prisma.insight.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.schemaMetadata.deleteMany()
  await prisma.connection.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing data')

  // ─── Test User ────────────────────────────────────────────────────────────
  const user = await prisma.user.create({
    data: {
      id: 'seed-user-001',
      email: 'dev@datavue.local',
      passwordHash: null, // Clerk handles auth, no password stored
      llmProvider: LLMProvider.ANTHROPIC,
      encryptedApiKey: null,
    },
  })

  console.log(`✅ Created test user: ${user.email}`)

  // ─── Test Connection ──────────────────────────────────────────────────────
  // NOTE: encryptedCredentials here is a plain JSON string
  // In production this will always be AES-256-GCM encrypted
  // We use a raw placeholder here because the encryption utility
  // doesn't exist yet — replace this once encryption.ts is built
  const rawCredentials = JSON.stringify({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'datavue',
    ssl: false,
  })

  const connection = await prisma.connection.create({
    data: {
      id: 'seed-conn-001',
      userId: user.id,
      label: 'Local Dev Database',
      dbType: DBType.POSTGRES,
      encryptedCredentials: encryptObject({
        host : "localhost",
        port : 5432,
        user : "postgres",
        password : "password",
        database : "datavue",
        ssl : false
      }), // ← swap for encrypt(rawCredentials) later
      syncStatus: SyncStatus.PENDING,
      piiColumns: [],
      isArchived: false,
    },
  })

  console.log(`✅ Created test connection: ${connection.label}`)

  // ─── Default Dashboard Page ───────────────────────────────────────────────
  const dashboardPage = await prisma.dashboardPage.create({
    data: {
      userId: user.id,
      name: 'My Dashboard',
      description: 'Default dashboard page',
      isDefault: true,
      isShared: false,
    },
  })

  console.log(`✅ Created default dashboard page: ${dashboardPage.name}`)

  // ─── Pre-built Monitored Metric Templates ─────────────────────────────────
  // These are Datavue's built-in templates (isTemplate: true)
  // Users select from these and a new record is created with isTemplate: false
  const metricTemplates = [
    {
      name: 'Daily New Signups',
      description: 'Tracks how many new users registered today.',
      queryTemplate: `SELECT COUNT(*) as value FROM users WHERE created_at >= CURRENT_DATE`,
      thresholdPercent: 15.0,
    },
    {
      name: 'Daily Revenue',
      description: 'Total revenue collected today.',
      queryTemplate: `SELECT COALESCE(SUM(amount), 0) as value FROM orders WHERE created_at >= CURRENT_DATE AND status = 'paid'`,
      thresholdPercent: 15.0,
    },
    {
      name: 'Active Sessions',
      description: 'Number of active user sessions right now.',
      queryTemplate: `SELECT COUNT(*) as value FROM sessions WHERE last_active_at >= NOW() - INTERVAL '30 minutes'`,
      thresholdPercent: 20.0,
    },
    {
      name: 'Failed Payment Rate',
      description: 'Percentage of payment attempts that failed today.',
      queryTemplate: `
        SELECT 
          ROUND(
            COUNT(*) FILTER (WHERE status = 'failed') * 100.0 / NULLIF(COUNT(*), 0), 
            2
          ) as value 
        FROM payments 
        WHERE created_at >= CURRENT_DATE
      `,
      thresholdPercent: 5.0,
    },
  ]

  for (const template of metricTemplates) {
    await prisma.monitoredMetric.create({
      data: {
        userId: user.id,
        connectionId: connection.id,
        name: template.name,
        description: template.description,
        queryTemplate: template.queryTemplate,
        comparisonType: 'DAY_OVER_DAY',
        thresholdPercent: template.thresholdPercent,
        isTemplate: true,
        isActive: false, // templates are inactive until a user activates them
        notifyEmail: false,
      },
    })
  }

  console.log(`✅ Created ${metricTemplates.length} metric templates`)

  // ─── Empty Conversation ───────────────────────────────────────────────────
  // Pre-create the conversation record so the agent
  // doesn't have to upsert on every first message
  await prisma.conversation.create({
    data: {
      userId: user.id,
      connectionId: connection.id,
      messages: [],
    },
  })

  console.log(`✅ Created empty conversation for test connection`)

  console.log('\n🎉 Seed complete.\n')
  console.log('Test credentials:')
  console.log(`  User ID     : ${user.id}`)
  console.log(`  Email       : ${user.email}`)
  console.log(`  Connection  : ${connection.id}`)
  console.log(`  Dashboard   : ${dashboardPage.id}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
