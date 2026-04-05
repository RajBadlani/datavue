import { Queue } from 'bullmq'
import { redis } from '@/lib/redis'

// ─── Queue Names ───────────────────────────────────────────────────────────────
// Centralised here so nothing in the app hardcodes queue name strings
export const QUEUES = {
  METADATA_SYNC: 'metadata-sync',
  INSIGHT_CRON:  'insight-cron',
} as const

// ─── Metadata Sync Queue ───────────────────────────────────────────────────────
// Triggered when a connection is created or manually re-synced
// Worker lives in src/workers/metadata-sync.worker.ts
export interface MetadataSyncJobData {
  connectionId: string
  userId: string
}

export const metadataSyncQueue = new Queue<MetadataSyncJobData>(
  QUEUES.METADATA_SYNC,
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000, // 5s → 25s → 125s
      },
      removeOnComplete: 100, // Keep last 100 completed jobs for visibility
      removeOnFail: 500,     // Keep last 500 failed jobs for debugging
    },
  }
)