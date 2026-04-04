-- CreateTable
CREATE TABLE "schema_metadata" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "schemaName" TEXT NOT NULL DEFAULT 'public',
    "columns" JSONB NOT NULL,
    "primaryKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "foreignKeys" JSONB NOT NULL DEFAULT '[]',
    "indexes" JSONB NOT NULL DEFAULT '[]',
    "rowEstimate" BIGINT NOT NULL DEFAULT 0,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schema_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schema_metadata_connectionId_idx" ON "schema_metadata"("connectionId");

-- CreateIndex
CREATE UNIQUE INDEX "schema_metadata_connectionId_tableName_schemaName_key" ON "schema_metadata"("connectionId", "tableName", "schemaName");

-- AddForeignKey
ALTER TABLE "schema_metadata" ADD CONSTRAINT "schema_metadata_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
