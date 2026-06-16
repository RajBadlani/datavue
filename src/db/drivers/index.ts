import { PostgresDriver, type PostgresDriverOptions } from './postgres.driver'
import { DatabaseDriver, ConnectionCredentials } from './base.driver'
import { DBType } from '@/generated/prisma/enums'


export function createDriver(
  dbType: DBType,
  credentials: ConnectionCredentials,
  options?: PostgresDriverOptions
): DatabaseDriver {
  switch (dbType) {
    case DBType.POSTGRES:
      return new PostgresDriver(credentials, options)

    case DBType.MYSQL:
    case DBType.MONGODB:
    case DBType.SQLITE:
      throw new Error(`Driver for ${dbType} is not yet implemented.`)

    default:
      throw new Error(`Unknown database type: ${dbType}`)
  }
}

export type { DatabaseDriver, ConnectionCredentials }
export type { PostgresDriverOptions }