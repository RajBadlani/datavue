'use client'

import type { ChatQueryResult } from './use-chat-stream'

type ChatTableProps = {
  result: ChatQueryResult
}

export function ChatTable({ result }: ChatTableProps) {
  if (!result.rows.length || !result.fields.length) return null

  return (
    <div className="mt-3 overflow-hidden rounded-[16px] border border-[#E5E0D4]">
      <div className="flex items-center justify-between border-b border-[#E5E0D4] bg-[#FCFAF5] px-4 py-2">
        <span className="text-[12px] font-semibold text-[#313852]">
          Results
        </span>
        <span className="text-[12px] text-[#7B7E8F]">
          {result.rowCount} row{result.rowCount !== 1 ? 's' : ''}
          {result.isTruncated ? ' (truncated)' : ''}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#E5E0D4] bg-[#F7F4EB]">
              {result.fields.map(field => (
                <th
                  key={field}
                  className="whitespace-nowrap px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7B7E8F]"
                >
                  {field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-[#E5E0D4] last:border-b-0 hover:bg-[#FCFAF5]"
              >
                {result.fields.map(field => (
                  <td
                    key={field}
                    className="whitespace-nowrap px-4 py-2 text-[#313852]"
                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    {formatCellValue(row[field])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
