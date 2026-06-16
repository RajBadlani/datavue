import { metadataSyncQueue } from "@/jobs/queue";
import { ApiError, Errors } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/server/resolve-user";
import { evictSharedPool } from "@/db/drivers/postgres.driver";
import { createDriver, type ConnectionCredentials } from "@/db/drivers";
import { decryptObject, encryptObject } from "@/lib/encryption";
import { DBType } from "@/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";

interface UpdateConnectionBody {
  label?: string;
  ssl?: boolean;
  sslRejectUnauthorized?: boolean;
  caCert?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

// ─── GET /api/connections/[connectionId] ─────────────────────────────────────
// Single-connection detail with the decrypted, non-secret form fields needed to
// prefill the edit form. The password is never returned; caCert is reported as
// a boolean presence flag, not echoed.
export const GET = withErrorHandler(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ connectionId: string }> },
  ) => {
    const user = await requireCurrentUser();
    const { connectionId } = await params;

    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, userId: user.id, isArchived: false },
      select: {
        id: true,
        label: true,
        dbType: true,
        syncStatus: true,
        lastSyncedAt: true,
        createdAt: true,
        piiColumns: true,
        encryptedCredentials: true,
      },
    });

    if (!connection) {
      throw Errors.CONNECTION_NOT_FOUND;
    }

    let credentials: ConnectionCredentials | null = null;
    try {
      credentials = decryptObject<ConnectionCredentials>(connection.encryptedCredentials);
    } catch (error) {
      console.error(`[connections] Failed to decrypt credentials for ${connection.id}:`, error);
    }

    return NextResponse.json({
      id: connection.id,
      label: connection.label,
      dbType: connection.dbType,
      syncStatus: connection.syncStatus,
      lastSyncedAt: connection.lastSyncedAt,
      createdAt: connection.createdAt,
      piiColumns: connection.piiColumns,
      host: credentials?.host ?? "",
      port: credentials?.port ?? null,
      database: credentials?.database ?? "",
      user: credentials?.user ?? "",
      ssl: credentials?.ssl ?? false,
      sslRejectUnauthorized: credentials?.sslRejectUnauthorized ?? true,
      hasCaCert: Boolean(credentials?.caCert),
    });
  },
);

// ─── PATCH /api/connections/[connectionId] ───────────────────────────────────
// Edit a connection's label and/or connection details. Any credential change is
// re-tested before it is persisted, the new credentials are re-encrypted, and
// the process-cached pool is evicted so the next query uses fresh credentials.
export const PATCH = withErrorHandler(
  async (
    req: NextRequest,
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

    const body = (await req.json()) as UpdateConnectionBody;

    const data: { label?: string; encryptedCredentials?: string } = {};

    // ── Label ──────────────────────────────────────────────────────────────
    if (body.label !== undefined) {
      const trimmed = body.label.trim();
      if (trimmed.length < 2 || trimmed.length > 50) {
        throw new ApiError(
          "INVALID_LABEL",
          "Connection label must be between 2 and 50 characters",
          400,
        );
      }
      data.label = trimmed;
    }

    // ── Credential fields (any of these → re-test + re-encrypt + evict) ──────
    const credentialFieldProvided =
      body.host !== undefined ||
      body.port !== undefined ||
      body.user !== undefined ||
      body.password !== undefined ||
      body.database !== undefined ||
      body.ssl !== undefined ||
      body.sslRejectUnauthorized !== undefined ||
      body.caCert !== undefined;

    let credentialsChanged = false;

    if (credentialFieldProvided) {
      let existing: ConnectionCredentials;
      try {
        existing = decryptObject<ConnectionCredentials>(connection.encryptedCredentials);
      } catch {
        throw new ApiError(
          "CREDENTIALS_UNAVAILABLE",
          "Could not load existing connection credentials to update",
          500,
        );
      }

      // Merge: only provided fields override. Password is kept unless a new
      // non-empty one is supplied (the edit form never receives the old one).
      const next: ConnectionCredentials = {
        host: body.host ?? existing.host,
        port: body.port !== undefined ? Number(body.port) : existing.port,
        user: body.user ?? existing.user,
        password: body.password ? body.password : existing.password,
        database: body.database ?? existing.database,
        ssl: body.ssl !== undefined ? Boolean(body.ssl) : existing.ssl,
        ...(body.sslRejectUnauthorized !== undefined
          ? { sslRejectUnauthorized: body.sslRejectUnauthorized }
          : existing.sslRejectUnauthorized !== undefined
            ? { sslRejectUnauthorized: existing.sslRejectUnauthorized }
            : {}),
        ...(body.caCert !== undefined
          ? body.caCert
            ? { caCert: body.caCert }
            : {}
          : existing.caCert
            ? { caCert: existing.caCert }
            : {}),
      };

      // Re-test before persisting so a broken edit can't be saved.
      const driver = createDriver(connection.dbType as DBType, next);
      try {
        await driver.testConnection();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[connections] Re-test failed for ${connection.id}:`, message);
        throw new ApiError(
          "CONNECTION_FAILED",
          "Could not connect to the database with the updated details",
          400,
        );
      } finally {
        await driver.disconnect();
      }

      data.encryptedCredentials = encryptObject(next);
      credentialsChanged = true;
    }

    if (Object.keys(data).length === 0) {
      throw new ApiError("INVALID_INPUT", "No updatable fields were provided", 400);
    }

    const updated = await prisma.connection.update({
      where: { id: connection.id },
      data,
      select: {
        id: true,
        label: true,
        dbType: true,
        syncStatus: true,
        lastSyncedAt: true,
        updatedAt: true,
      },
    });

    // Credentials changed → drop the cached pool so the next query reconnects
    // with the new credentials instead of reusing a pool built on the old ones.
    if (credentialsChanged) {
      await evictSharedPool(connection.id);
    }

    return NextResponse.json(updated);
  },
);

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

    // Release any process-cached pool for this connection so its Pool object
    // and open sockets are not leaked after the row is gone.
    await evictSharedPool(connection.id);

    return NextResponse.json({
      deleted: {
        connectionId: connection.id,
      },
    });
  },
);
