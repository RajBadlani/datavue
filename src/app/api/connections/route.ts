import { ConnectionCredentials, createDriver } from "@/db/drivers";
import { DBType, SyncStatus } from "@/generated/prisma/enums";
import { metadataSyncQueue } from "@/jobs/queue";
import { ApiError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-handler";
import { decryptObject, encryptObject } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/server/resolve-user";
import { NextRequest, NextResponse } from "next/server";

interface CreateConnectionBody {
  label: string;
  dbType: DBType;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await requireCurrentUser()

  const body = (await req.json()) as CreateConnectionBody;
  const { label, dbType, host, port, user: dbUser, password, database, ssl } = body;

  if (!label || !dbType || !host || !port || !dbUser || !password || !database) {
    throw new ApiError(
      "INVALID_INPUT",
      "Missing required fields: label, dbType, host, port, user, password, database",
      400,
    );
  }
  if (label.trim().length < 2 || label.trim().length > 50) {
    throw new ApiError(
      "INVALID_LABEL",
      "Connection label must be between 2 and 50 characters",
      400,
    );
  }
  if (!Object.values(DBType).includes(dbType)) {
    throw new ApiError(
      "INVALID_DB_TYPE",
      `Unsupported database type: ${dbType}`,
      400,
    );
  }

  const credentials: ConnectionCredentials = {
    host,
    port: Number(port),
    user: dbUser,
    password,
    database,
    ssl: Boolean(ssl),
  };

  const driver = createDriver(dbType, credentials);

  try {
    await driver.testConnection();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new ApiError(
      "CONNECTION_FAILED",
      `Could not connect to database: ${message}`,
      400,
    );
  } finally {
    await driver.disconnect();
  }

  const encryptedCredentials = encryptObject({
    host,
    port: Number(port),
    user: dbUser,
    password,
    database,
    ssl: Boolean(ssl),
  });

  const connection = await prisma.connection.create({
    data: {
      userId: user.id,
      label: label.trim(),
      dbType,
      encryptedCredentials,
      syncStatus: SyncStatus.PENDING,
      piiColumns: [],
      isArchived: false,
    },
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
    throw new ApiError(
      "SYNC_QUEUE_FAILED",
      `Connection saved but schema sync could not be queued: ${message}`,
      500,
    );
  }

  return NextResponse.json(
    {
      id: connection.id,
      label: connection.label,
      dbType: connection.dbType,
      syncStatus: connection.syncStatus,
      createdAt: connection.createdAt,
    },
    { status: 201 },
  );
});


export const GET = withErrorHandler(async () => {
  const user = await requireCurrentUser()

  const connections = await prisma.connection.findMany({
    where: {
      userId: user.id,
      isArchived: false,
    },
    select: {
      id: true,
      label: true,
      dbType: true,
      syncStatus: true,
      lastSyncedAt: true,
      createdAt: true,
      encryptedCredentials: true,
      schemaMetadata: {
        select: {
          id: true,
          tableName: true,
          schemaName: true,
          columns: true,
          primaryKeys: true,
          foreignKeys: true,
          rowEstimate: true,
        },
        orderBy: {
          tableName: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const hydratedConnections = connections.map(connection => {
    let credentials: ConnectionCredentials | null = null

    try {
      credentials = decryptObject<ConnectionCredentials>(connection.encryptedCredentials)
    } catch (error) {
      console.error(`[connections] Failed to decrypt credentials for ${connection.id}:`, error)
    }

    return {
      id: connection.id,
      label: connection.label,
      dbType: connection.dbType,
      syncStatus: connection.syncStatus,
      lastSyncedAt: connection.lastSyncedAt,
      createdAt: connection.createdAt,
      host: credentials?.host ?? '',
      port: credentials?.port ?? null,
      database: credentials?.database ?? '',
      user: credentials?.user ?? '',
      ssl: credentials?.ssl ?? false,
      tableCount: connection.schemaMetadata.length,
      schema: connection.schemaMetadata.map(table => ({
        ...table,
        rowEstimate: table.rowEstimate.toString(),
      })),
    }
  })

  return NextResponse.json({ connections: hydratedConnections })
})
