/* eslint-disable @typescript-eslint/no-explicit-any */
import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { createDriver } from "@/db/drivers";
import { decryptObject } from "@/lib/encryption";

import { ConnectionCredentials, TableMetadata } from "@/db/drivers/base.driver";
import { MetadataSyncJobData, QUEUES } from "@/jobs/queue";
import { DBType, SyncStatus } from "@/generated/prisma/enums";

// ─── Process a single sync job ────────────────────────────────────────────────
async function processSyncJob(job: Job<MetadataSyncJobData>): Promise<void> {
  const { connectionId, userId } = job.data;

  console.log(`[sync-worker] Starting sync for connection ${connectionId}`);

  // ─── Step 1: Fetch connection from DB ──────────────────────────────────
  const connection = await prisma.connection.findFirst({
    where: { id: connectionId, userId },
  });

  if (!connection) {
    // Connection was deleted before the job ran — not an error worth retrying
    console.log(
      `[sync-worker] Connection ${connectionId} not found. Skipping.`,
    );
    return;
  }

  // ─── Step 2: Mark as SYNCING ───────────────────────────────────────────
  await prisma.connection.update({
    where: { id: connectionId },
    data: { syncStatus: SyncStatus.SYNCING },
  });

  // ─── Step 3: Decrypt credentials ──────────────────────────────────────
  // We wrap everything from here in try/catch because:
  // - Decryption could fail if the key changed
  // - The user's database could be unreachable
  // - Any table's metadata query could fail
  // All of these should mark the connection FAILED and let BullMQ retry
  try {
    const credentials = decryptObject<ConnectionCredentials>(
      connection.encryptedCredentials,
    );
    // ─── Step 4: Instantiate driver and sync ─────────────────────────────
    const driver = createDriver(connection.dbType as DBType, credentials);

    let tables: TableMetadata[] = [];

    try {
      tables = await driver.syncMetadata();
    } finally {
      await driver.disconnect();
    }

    console.log(
      `[sync-worker] Found ${tables.length} tables for connection ${connectionId}`,
    );

    // ─── Step 5: Upsert schema metadata ──────────────────────────────────
    // We upsert rather than delete-and-insert so that if the sync
    // partially fails, previously synced tables remain visible
    for (const table of tables) {
      await prisma.schemaMetadata.upsert({
        where: {
          connectionId_tableName_schemaName: {
            connectionId,
            tableName: table.tableName,
            schemaName: table.schemaName,
          },
        },
        update: {
          columns: table.columns as any,
          primaryKeys: table.primaryKeys,
          foreignKeys: table.foreignKeys as any,
          indexes: table.indexes,
          rowEstimate: table.rowEstimate,
          syncedAt: new Date(),
        },
        create: {
          connectionId,
          tableName: table.tableName,
          schemaName: table.schemaName,
          columns: table.columns as any,
          primaryKeys: table.primaryKeys,
          foreignKeys: table.foreignKeys as any,
          indexes: table.indexes,
          rowEstimate: table.rowEstimate,
        },
      });
    }

    // ─── Step 6: Mark as SYNCED ───────────────────────────────────────────
    await prisma.connection.update({
      where: { id: connectionId },
      data: {
        syncStatus: SyncStatus.SYNCED,
        lastSyncedAt: new Date(),
      },
    });

    console.log(
      `[sync-worker] Sync complete for connection ${connectionId}. ${tables.length} tables synced.`,
    );
  } catch (error) {
    // ─── Step 7: Mark as FAILED ───────────────────────────────────────────
    // We update the DB first, then re-throw so BullMQ knows the job failed
    // and applies the retry/backoff logic we configured in queues.ts
    console.error(
      `[sync-worker] Sync failed for connection ${connectionId}:`,
      error,
    );

    await prisma.connection.update({
      where: { id: connectionId },
      data: { syncStatus: SyncStatus.FAILED },
    });

    // Re-throw so BullMQ marks the job as FAILED and schedules retry
    throw error;
  }
}

// ─── Worker Instance ──────────────────────────────────────────────────────────
export const metadataSyncWorker = new Worker<MetadataSyncJobData>(
  QUEUES.METADATA_SYNC,
  processSyncJob,
  {
    connection: redis,
    concurrency: 5, // Process up to 5 sync jobs simultaneously
  },
);

// ─── Worker Event Listeners ───────────────────────────────────────────────────
metadataSyncWorker.on("completed", (job) => {
  console.log(`[sync-worker] Job ${job.id} completed successfully`);
});

metadataSyncWorker.on("failed", (job, error) => {
  console.error(`[sync-worker] Job ${job?.id} failed:`, error.message);
});

metadataSyncWorker.on("error", (error) => {
  console.error("[sync-worker] Worker error:", error);
});
