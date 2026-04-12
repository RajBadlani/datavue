import type { ConnectionRecord, DbType } from '@/components/connections/types'

export const dbTypeOptions: Array<{ value: DbType; label: string; defaultPort: string }> = [
  { value: 'postgresql', label: 'PostgreSQL', defaultPort: '5432' },
  { value: 'mysql', label: 'MySQL', defaultPort: '3306' },
  { value: 'supabase', label: 'Supabase', defaultPort: '5432' },
]

export const sslModeOptions = ['Disable', 'Allow', 'Prefer', 'Require', 'Verify-CA', 'Verify-Full']

export const initialConnections: ConnectionRecord[] = [
  {
    id: 'conn-1',
    name: 'Northstar Production',
    host: 'postgres://prod-db.aws.internal:5432/analytics',
    port: '5432',
    dbName: 'analytics',
    username: 'readonly_prod',
    dbType: 'postgresql',
    status: 'untested',
    version: 'PostgreSQL 15.2',
    tableCount: 12,
    lastQueried: '2h ago',
    createdAt: 'Mar 18, 2026',
    totalQueries: 248,
    sslMode: 'Require',
    schema: [
      {
        name: 'orders',
        rowCount: '1.2M rows',
        columns: [
          { name: 'id', type: 'UUID', isPrimaryKey: true },
          { name: 'account_id', type: 'UUID', isForeignKey: true },
          { name: 'total_revenue', type: 'NUMERIC' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
      },
      {
        name: 'accounts',
        rowCount: '42K rows',
        columns: [
          { name: 'id', type: 'UUID', isPrimaryKey: true },
          { name: 'segment', type: 'VARCHAR' },
          { name: 'owner_id', type: 'UUID', isForeignKey: true },
        ],
      },
    ],
    history: [
      { id: 'h1', query: 'Show me weekly revenue trends for enterprise accounts since January', status: 'success', timestamp: '11:42 AM' },
      { id: 'h2', query: 'Which accounts are at risk of churn after the pricing change?', status: 'success', timestamp: '9:08 AM' },
      { id: 'h3', query: 'Compare mobile vs desktop checkout conversion by week', status: 'failed', timestamp: 'Yesterday' },
    ],
  },
  // {
  //   id: 'conn-2',
  //   name: 'Analytics Replica',
  //   host: 'mysql://replica.internal:3306/revenue_mart',
  //   port: '3306',
  //   dbName: 'revenue_mart',
  //   username: 'readonly_replica',
  //   dbType: 'mysql',
  //   status: 'untested',
  //   version: 'MySQL 8.0',
  //   tableCount: 5,
  //   lastQueried: '2d ago',
  //   createdAt: 'Feb 27, 2026',
  //   totalQueries: 61,
  //   sslMode: 'Prefer',
  //   simulatedError: 'dial tcp 10.17.4.18:3306: connect: connection refused',
  //   schema: [
  //     {
  //       name: 'campaign_performance',
  //       rowCount: '168K rows',
  //       columns: [
  //         { name: 'campaign_id', type: 'VARCHAR', isPrimaryKey: true },
  //         { name: 'spend', type: 'DECIMAL' },
  //         { name: 'pipeline', type: 'DECIMAL' },
  //       ],
  //     },
  //   ],
  //   history: [
  //     { id: 'h4', query: 'Top acquisition channels by pipeline for the last quarter', status: 'success', timestamp: '2d ago' },
  //     { id: 'h5', query: 'Compare CAC efficiency across paid social campaigns', status: 'failed', timestamp: '4d ago' },
  //   ],
  // },
  {
    id: 'conn-3',
    name: 'Customer Events',
    host: 'mongodb://events-cluster.internal:27017/customer_events',
    port: '27017',
    dbName: 'customer_events',
    username: 'events_reader',
    dbType: 'mongodb',
    status: 'untested',
    version: 'MongoDB 7.0',
    tableCount: 8,
    lastQueried: '5h ago',
    createdAt: 'Apr 02, 2026',
    totalQueries: 97,
    sslMode: 'Require',
    schema: [
      {
        name: 'sessions',
        rowCount: '9.4M docs',
        columns: [
          { name: '_id', type: 'OBJECT_ID', isPrimaryKey: true },
          { name: 'userId', type: 'VARCHAR', isForeignKey: true },
          { name: 'eventType', type: 'VARCHAR' },
          { name: 'timestamp', type: 'TIMESTAMPTZ' },
        ],
      },
    ],
    history: [
      { id: 'h6', query: 'What events happen immediately before failed checkouts?', status: 'success', timestamp: '5h ago' },
      { id: 'h7', query: 'Break session abandonment by browser and device class', status: 'success', timestamp: '1d ago' },
    ],
  },
]

export const connectionNotifications = [
  'Your credentials are encrypted at rest and never leave your infrastructure.',
  'Use Import from .env to prefill database credentials without manual typing.',
]
