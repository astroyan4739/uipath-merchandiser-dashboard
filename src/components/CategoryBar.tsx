import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell, Legend,
} from 'recharts'
import type { SKU, Category } from '../data/types'

interface CategoryBarProps {
  skus: SKU[]
}

function buildData(skus: SKU[]) {
  const cats = [...new Set(skus.map(s => s.category))] as Category[]
  return cats
    .map(cat => {
      const g = skus.filter(s => s.category === cat)
      return {
        cat,
        avgST: +(g.reduce((a, s) => a + s.sell_through_pct, 0) / g.length).toFixed(1),
        avgMargin: +(g.reduce((a, s) => a + s.gross_margin_pct, 0) / g.length).toFixed(1),
        critical: g.filter(s => s.urgency_label === 'Critical').length,
        total: g.length,
      }
    })
    .sort((a, b) => b.critical - a.critical)
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e4e4e7',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <div style={{ fontWeight: 600, color: '#18181b', marginBottom: 8 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginBottom: 2 }}>
          <span style={{ color: '#71717a' }}>{p.name}</span>
          <span style={{ fontWeight: 600, color: '#18181b' }}>{p.value}%</span>
        </div>
      ))}
      <div style={{ color: '#a1a1aa', marginTop: 6, fontSize: 10 }}>Target ST: 58%</div>
    </div>
  )
}

export function CategoryBar({ skus }: CategoryBarProps) {
  const data = buildData(skus)

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e4e4e7',
      borderRadius: 10,
      padding: '20px 20px 14px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#18181b', marginBottom: 3 }}>
          Category Performance
        </div>
        <div style={{ fontSize: 11, color: '#a1a1aa' }}>
          Avg ST% vs margin · sorted by critical count
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="2 4" stroke="#f4f4f5" vertical={false} />
          <XAxis dataKey="cat" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 80]} tickFormatter={v => `${v}%`} tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#71717a', paddingTop: 10 }} iconType="circle" iconSize={7} />
          <ReferenceLine y={58} stroke="#6366f1" strokeDasharray="3 3" strokeOpacity={0.6} strokeWidth={1.5} />
          <Bar dataKey="avgST" name="Avg ST %" maxBarSize={24} radius={[3, 3, 0, 0]}>
            {data.map(entry => (
              <Cell
                key={entry.cat}
                fill={entry.avgST >= 58 ? '#22c55e' : entry.avgST >= 45 ? '#f59e0b' : '#ef4444'}
                fillOpacity={0.75}
              />
            ))}
          </Bar>
          <Bar dataKey="avgMargin" name="Avg Margin %" fill="#6366f1" fillOpacity={0.5} maxBarSize={24} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f4f4f5', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {data.map(d => (
          <div key={d.cat} style={{ fontSize: 11, color: '#a1a1aa' }}>
            <span style={{ color: '#18181b', fontWeight: 500 }}>{d.cat}</span>
            {' · '}
            <span style={{ color: '#dc2626' }}>{d.critical} critical</span>
            {' / '}{d.total}
          </div>
        ))}
      </div>
    </div>
  )
}
