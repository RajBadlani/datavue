export const authDemoQuery = 'Show me weekly revenue trends for enterprise accounts since January.'

export const authDemoSql = `SELECT week_start, SUM(revenue) AS total_revenue
FROM account_revenue
WHERE segment = 'enterprise'
  AND week_start >= DATE '2026-01-01'
GROUP BY week_start
ORDER BY week_start;`

export const authDemoRows = [
  ['Enterprise Plus', 'Jan 08', '$48.2K'],
  ['Enterprise Core', 'Jan 15', '$51.7K'],
  ['Strategic', 'Jan 22', '$57.4K'],
] as const
