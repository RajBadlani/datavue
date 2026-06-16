import { ApiError, Errors } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/server/resolve-user";
import { createDriver, type ConnectionCredentials } from "@/db/drivers";
import { decryptObject } from "@/lib/encryption";
import { DBType } from "@/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";

// ─── POST /api/connections/[connectionId]/test ───────────────────────────────
// Health-check an already-saved connection using its stored credentials. The
// client never holds the password, so it cannot use the generic /test route —
// we decrypt server-side, probe, and return only success + latency.
export const POST = withErrorHandler(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ connectionId: string }> },
  ) => {
    const user = await requireCurrentUser();
    const { connectionId } = await params;

    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, userId: user.id, isArchived: false },
      select: { id: true, dbType: true, encryptedCredentials: true },
    });

    if (!connection) {
      throw Errors.CONNECTION_NOT_FOUND;
    }

    let credentials: ConnectionCredentials;
    try {
      credentials = decryptObject<ConnectionCredentials>(connection.encryptedCredentials);
    } catch {
      throw new ApiError(
        "CREDENTIALS_UNAVAILABLE",
        "Could not load connection credentials for the health check",
        500,
      );
    }

    // Use a throwaway pool (no shared option) so a transient probe never
    // disturbs the cached query pool.
    const driver = createDriver(connection.dbType as DBType, credentials);

    try {
      const result = await driver.testConnection();
      return NextResponse.json({
        success: result.success,
        latencyMs: result.latencyMs,
        message: `Connected successfully in ${result.latencyMs}ms`,
      });
    } catch (error) {
      console.error(`[connections] Health check failed for ${connection.id}:`, error);
      // Don't leak the raw driver error to the client.
      throw new ApiError("CONNECTION_FAILED", "Could not reach the database", 502);
    } finally {
      await driver.disconnect();
    }
  },
);
