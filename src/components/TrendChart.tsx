import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DailyPoint } from '../data/shopifyData'

interface Props {
  current: DailyPoint[]
  metric: 'sales' | 'orders' | 'sellThrough' | 'grossMargin'
}

const METRIC_CONFIG = {
  sales:       { label: 'Sales (£)', format: (v: number) => `£${v.toLocaleString()}`, color: '#6366f1' },
  orders:      { label: 'Orders',    format: (v: number) => String(Math.round(v)),    color: '#6366f1' },
  sellThrough: { label: 'Sell-Through (%)', format: (v: number) => `${v.toFixed(1)}%`, color: '#6366f1' },
  grossMargin: { label: 'Gross Margin (%)', format: (v: number) => `${v.toFixed(1)}%`, color: '#6366f1' },
}

function buildChartData(current: DailyPoint[], metric: string) {
  return current.map(d => ({
    date: d.date,
    value: d[metric as keyof DailyPoint] as number,
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, metric }: any) {
  if (!active || !payload?.length) return null
  const cfg = METRIC_CONFIG[metric as keyof typeof METRIC_CONFIG]
  return (
    <div style={{
      background: '#1e1e2e', border: '1px solid #334155',
      borderRadius: 8, padding: '10px 14px',
      fontSize: 12, boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#a5b4fc' }}>{cfg.format(payload[0].value)}</div>
    </div>
  )
}

export function TrendChart({ current, metric }: Props) {
  const cfg = METRIC_CONFIG[metric]
  const data = buildChartData(current, metric)

  // Show every 5th label to avoid crowding
  const tickFormatter = (val: string, idx: number) => idx % 5 === 0 ? val : ''

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickFormatter={tickFormatter}
          tick={{ fontSize: 10, fill: 'var(--text-subtle)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={cfg.format}
          tick={{ fontSize: 10, fill: 'var(--text-subtle)' }}
          axisLine={false}
          tickLine={false}
          width={50}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip metric={metric} />} />
        <Line
          dataKey="value"
          stroke={cfg.color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: cfg.color }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
