import "dotenv/config"

// This file is the entry point for the worker process
// It runs separately from the Next.js app server
// In development: run with `npx tsx src/workers/index.ts`
// In production: run as a separate container (see docker-compose.yml)

import { metadataSyncWorker } from './metadata-sync.worker'

const requiredEnvVars = ['DATABASE_URL', 'REDIS_URL', 'ENCRYPTION_KEY'] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is required to start the worker process`)
  }
}

console.log('🔧 Worker process started')
console.log('📋 Listening on queues:')
console.log('   → metadata-sync')

// Graceful shutdown — finish active jobs before exiting
// Without this, a CTRL+C mid-sync would leave connections in SYNCING state

const shutdown = async () => {
  console.log('\n⏳ Shutting down workers gracefully...')
  await metadataSyncWorker.close()
  console.log('✅ Workers shut down cleanly')
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
