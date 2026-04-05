import { ConnectionCredentials, createDriver } from "@/db/drivers";
import { DBType, SyncStatus } from "@/generated/prisma/enums";
import { metadataSyncQueue } from "@/jobs/queue";
import { ApiError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-handler";
import { encryptObject } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
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

  const { userId } = await auth();
  if (!userId) throw new ApiError("UNAUTHORIZED", "Authentication required", 401);

  //const userId = "seed-user-001"
  const body = (await req.json()) as CreateConnectionBody;
  const { label, dbType, host, port, user, password, database, ssl } = body;

  if (!label || !dbType || !host || !port || !user || !password || !database) {
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
    user,
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
    user,
    password,
    database,
    ssl: Boolean(ssl),
  });

  const connection = await prisma.connection.create({
    data: {
      userId,
      label: label.trim(),
      dbType,
      encryptedCredentials,
      syncStatus: SyncStatus.PENDING,
      piiColumns: [],
      isArchived: false,
    },
  });

  await metadataSyncQueue.add(`sync-${connection.id}`, {
    connectionId: connection.id,
    userId: userId,
  });

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


export const GET = withErrorHandler(async (req: NextRequest) => {
  const { userId } = await auth()
  if (!userId) throw new ApiError('UNAUTHORIZED', 'Authentication required', 401)

  const connections = await prisma.connection.findMany({
    where: {
      userId,
      isArchived: false,
    },
    select: {
      id: true,
      label: true,
      dbType: true,
      syncStatus: true,
      lastSyncedAt: true,
      createdAt: true,
      // Never select encryptedCredentials
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json({ connections })
})