import { metadataSyncQueue } from "@/jobs/queue";
import { Errors } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/server/resolve-user";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = withErrorHandler(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ connectionId: string }> },
  ) => {
    const user = await requireCurrentUser();
    const { connectionId } = await params;

    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        userId: user.id,
        isArchived: false,
      },
      select: {
        id: true,
      },
    });

    if (!connection) {
      throw Errors.CONNECTION_NOT_FOUND;
    }

    try {
      const queuedJobs = await metadataSyncQueue.getJobs([
        "waiting",
        "delayed",
        "paused",
      ]);
      await Promise.all(
        queuedJobs
          .filter((job) => job.data?.connectionId === connection.id)
          .map((job) => job.remove()),
      );
    } catch (error) {
      console.warn(
        `[connections] Could not remove queued metadata sync for ${connection.id}:`,
        error,
      );
    }

    await prisma.connection.delete({
      where: { id: connection.id },
    });

    return NextResponse.json({
      deleted: {
        connectionId: connection.id,
      },
    });
  },
);
