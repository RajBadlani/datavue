import { Prisma } from '@/generated/prisma/client'
import prisma from '@/lib/prisma'
import { requireUserOrRedirect } from '@/lib/server/resolve-user'
import { previewOwnedConnectionTable } from '@/lib/server/table-preview'
import {
  DashboardDataExplorer,
  type DashboardExplorerConnection,
  type DashboardExplorerPreview,
} from '@/components/dashboard/data-explorer'

type MetadataColumn = {
  name: string
  type: string
  isPrimaryKey: boolean
  isForeignKey: boolean
}

type MetadataForeignKey = {
  columnName: string
  referencedTable: string
  referencedColumn: string
}

function formatLastSynced(value: Date | null) {
  if (!value) {
    return 'Not synced yet'
  }

  const diffMs = Date.now() - value.getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))

  if (diffMinutes < 60) {
    return `Synced ${diffMinutes}m ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `Synced ${diffHours}h ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `Synced ${diffDays}d ago`
}

function normalizeColumns(value: Prisma.JsonValue, primaryKeys: string[], foreignKeys: MetadataForeignKey[]): MetadataColumn[] {
  if (!Array.isArray(value)) {
    return []
  }

  return (value as Prisma.JsonArray).flatMap((column): MetadataColumn[] => {
    if (!column || typeof column !== 'object' || Array.isArray(column)) {
      return []
    }

    const record = column as Record<string, unknown>
    const name = typeof record.name === 'string' ? record.name : null
    const type = typeof record.type === 'string'
      ? record.type
      : typeof record.data_type === 'string'
        ? record.data_type
        : typeof record.dataType === 'string'
          ? record.dataType
          : 'UNKNOWN'

    if (!name) {
      return []
    }

    return [{
      name,
      type,
      isPrimaryKey: primaryKeys.includes(name),
      isForeignKey: foreignKeys.some(foreignKey => foreignKey.columnName === name),
    }]
  })
}

function normalizeForeignKeys(value: Prisma.JsonValue): MetadataForeignKey[] {
  if (!Array.isArray(value)) {
    return []
  }

  return (value as Prisma.JsonArray).flatMap((foreignKey): MetadataForeignKey[] => {
    if (!foreignKey || typeof foreignKey !== 'object' || Array.isArray(foreignKey)) {
      return []
    }

    const record = foreignKey as Record<string, unknown>
    const columnName = typeof record.columnName === 'string'
      ? record.columnName
      : typeof record.column === 'string'
        ? record.column
        : null
    const referencedTable = typeof record.referencedTable === 'string' ? record.referencedTable : null
    const referencedColumn = typeof record.referencedColumn === 'string' ? record.referencedColumn : null

    if (!columnName || !referencedTable || !referencedColumn) {
      return []
    }

    return [{
      columnName,
      referencedTable,
      referencedColumn,
    }]
  })
}

export default async function DashboardPage() {
  const user = await requireUserOrRedirect()

  const rawConnections = await prisma.connection.findMany({
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
        orderBy: [
          { schemaName: 'asc' },
          { tableName: 'asc' },
        ],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const connections: DashboardExplorerConnection[] = rawConnections.map(connection => ({
    id: connection.id,
    label: connection.label,
    dbType: connection.dbType,
    syncStatus: connection.syncStatus,
    lastSyncedLabel: formatLastSynced(connection.lastSyncedAt),
    tableCount: connection.schemaMetadata.length,
    tables: connection.schemaMetadata.map(table => {
      const foreignKeys = normalizeForeignKeys(table.foreignKeys as Prisma.JsonValue)
      const columns = normalizeColumns(table.columns as Prisma.JsonValue, table.primaryKeys, foreignKeys)

      return {
        id: table.id,
        displayName: table.schemaName !== 'public' ? `${table.schemaName}.${table.tableName}` : table.tableName,
        tableName: table.tableName,
        schemaName: table.schemaName,
        rowEstimateLabel: `${table.rowEstimate.toString()} estimated rows`,
        columns,
        primaryKeys: table.primaryKeys,
        foreignKeys,
      }
    }),
  }))

  const initialConnection = connections.find(connection => connection.syncStatus === 'SYNCED' && connection.tables.length > 0) ?? connections[0] ?? null
  const initialTableId = initialConnection?.tables[0]?.id ?? null

  let initialPreview: DashboardExplorerPreview | null = null

  if (initialConnection && initialConnection.syncStatus === 'SYNCED' && initialTableId) {
    try {
      initialPreview = await previewOwnedConnectionTable({
        userId: user.id,
        connectionId: initialConnection.id,
        tableId: initialTableId,
        limit: 50,
      })
    } catch (error) {
      console.error(`[dashboard] Failed to load initial preview for ${initialConnection.id}/${initialTableId}:`, error)
    }
  }

  return (
    <DashboardDataExplorer
      connections={connections}
      initialConnectionId={initialConnection?.id ?? null}
      initialTableId={initialTableId}
      initialPreview={initialPreview}
    />
  )
}
