'use client'

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'
import type { ChatChartConfig, ChatQueryResult } from './use-chat-stream'

type ChatChartProps = {
  config: ChatChartConfig
  data: ChatQueryResult | null
}

const CHART_COLORS = [
  '#5849F2',
  '#7B7E8F',
  '#C2CBD4',
  '#EDEAFF',
  '#D8D2FF',
  '#F3EEE3',
]

export function ChatChart({ config, data }: ChatChartProps) {
  if (!data || !data.rows.length) return null
  if (config.type === 'none' || config.type === 'table') return null

  const rows = data.rows as Record<string, unknown>[]

  if (config.type === 'metric_card') {
    return (
      <div className="mt-3 flex items-center gap-4 rounded-[16px] border border-[#E5E0D4] bg-[#FCFAF5] p-6">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#7B7E8F]">
            {config.label ?? config.title ?? 'Metric'}
          </p>
          <p className="mt-1 text-[32px] font-bold leading-none tracking-[-0.02em] text-[#313852]">
            {config.value ?? (rows[0] && config.yKey ? String(rows[0][config.yKey]) : '—')}
          </p>
        </div>
      </div>
    )
  }

  const xKey = config.xKey ?? data.fields[0]
  const yKey = config.yKey ?? data.fields[1]

  return (
    <div className="mt-3 overflow-hidden rounded-[16px] border border-[#E5E0D4] bg-white p-4">
      {config.title ? (
        <p className="mb-3 text-[13px] font-semibold text-[#313852]">{config.title}</p>
      ) : null}
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(config, rows, xKey, yKey)}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function renderChart(
  config: ChatChartConfig,
  rows: Record<string, unknown>[],
  xKey: string,
  yKey: string
) {
  const series = config.series ?? [yKey]

  switch (config.type) {
    case 'bar':
      return (
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D4" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#7B7E8F' }} />
          <YAxis tick={{ fontSize: 11, fill: '#7B7E8F' }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #E5E0D4', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((key, i) => (
            <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      )

    case 'line':
      return (
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D4" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#7B7E8F' }} />
          <YAxis tick={{ fontSize: 11, fill: '#7B7E8F' }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #E5E0D4', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      )

    case 'area':
      return (
        <AreaChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D4" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#7B7E8F' }} />
          <YAxis tick={{ fontSize: 11, fill: '#7B7E8F' }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #E5E0D4', fontSize: 12 }}
          />
          {series.map((key, i) => (
            <Area key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.15} />
          ))}
        </AreaChart>
      )

    case 'pie':
      return (
        <PieChart>
          <Pie
            data={rows}
            dataKey={yKey}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name }) => String(name)}
            labelLine={false}
          >
            {rows.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #E5E0D4', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      )

    case 'scatter':
      return (
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D4" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#7B7E8F' }} />
          <YAxis tick={{ fontSize: 11, fill: '#7B7E8F' }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #E5E0D4', fontSize: 12 }}
          />
          <Line type="monotone" dataKey={yKey} stroke={CHART_COLORS[0]} dot={{ r: 4 }} strokeWidth={0} />
        </LineChart>
      )

    default:
      return (
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D4" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#7B7E8F' }} />
          <YAxis tick={{ fontSize: 11, fill: '#7B7E8F' }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #E5E0D4', fontSize: 12 }}
          />
          <Bar dataKey={yKey} fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      )
  }
}
