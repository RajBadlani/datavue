import { metadataSyncQueue } from "@/jobs/queue";
import { ApiError, Errors } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/server/resolve-user";
import { SyncStatus } from "@/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";

// ─── POST /api/connections/[connectionId]/sync ───────────────────────────────
// Manually re-enqueue a metadata sync for an owned connection. The worker and
// queue already exist (src/workers/metadata-sync.worker.ts); this only enqueues.
export const POST = withErrorHandler(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ connectionId: string }> },
  ) => {
    const user = await requireCurrentUser();
    const { connectionId } = await params;

    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, userId: user.id, isArchived: false },
      select: { id: true, syncStatus: true },
    });

    if (!connection) {
      throw Errors.CONNECTION_NOT_FOUND;
    }

    if (connection.syncStatus === SyncStatus.SYNCING || connection.syncStatus === SyncStatus.PENDING) {
      throw new ApiError(
        "SYNC_IN_PROGRESS",
        "A schema sync is already queued or running for this connection",
        409,
      );
    }

    await prisma.connection.update({
      where: { id: connection.id },
      data: { syncStatus: SyncStatus.PENDING },
    });

    try {
      await metadataSyncQueue.add(`sync-${connection.id}`, {
        connectionId: connection.id,
        userId: user.id,
      });
    } catch (error) {
      await prisma.connection.update({
        where: { id: connection.id },
        data: { syncStatus: SyncStatus.FAILED },
      });

      const message = error instanceof Error ? error.message : "Unknown queue error";
      console.error(`[connections] Failed to enqueue re-sync for ${connection.id}:`, message);
      throw new ApiError(
        "SYNC_QUEUE_FAILED",
        "Could not queue the schema sync. Please try again.",
        500,
      );
    }

    return NextResponse.json({
      connectionId: connection.id,
      syncStatus: SyncStatus.PENDING,
    });
  },
);
