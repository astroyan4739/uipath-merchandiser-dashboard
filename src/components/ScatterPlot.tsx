import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import type { SKU, AiDiagnosis } from '../data/types'
import { DIAGNOSIS_COLORS } from './DiagnosisBadge'

interface ScatterPlotProps {
  skus: SKU[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

const DIAGNOSES = Object.keys(DIAGNOSIS_COLORS) as AiDiagnosis[]

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: SKU }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const c = DIAGNOSIS_COLORS[d.ai_diagnosis]
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e4e4e7',
      borderRadius: 8,
      padding: '12px 14px',
      fontSize: 12,
      minWidth: 200,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 600, color: '#18181b', marginBottom: 2 }}>{d.product_name}</div>
      <div style={{ color: '#a1a1aa', marginBottom: 10, fontSize: 11 }}>{d.sku_id} · {d.category}</div>
      <div style={{ display: 'flex', gap: 18, marginBottom: 10 }}>
        <Metric label="Sell-Through" value={`${d.sell_through_pct.toFixed(1)}%`} />
        <Metric label="Margin" value={`${d.gross_margin_pct.toFixed(1)}%`} />
      </div>
      <div style={{
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.dot}33`,
        padding: '5px 9px',
        borderRadius: 16,
        fontSize: 11,
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        marginBottom: 6,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot }} />
        {d.ai_diagnosis}
      </div>
      <div style={{ color: '#71717a', fontSize: 11 }}>→ {d.recommended_action}</div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#a1a1aa', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#18181b' }}>{value}</div>
    </div>
  )
}

export function ScatterPlot({ skus, selectedId, onSelect }: ScatterPlotProps) {
  const data = skus.map(s => ({ ...s }))

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e4e4e7',
      borderRadius: 10,
      padding: '20px 20px 14px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#18181b', marginBottom: 3 }}>
            Sell-Through × Margin
          </div>
          <div style={{ fontSize: 11, color: '#a1a1aa' }}>
            Click a point to inspect · dashed lines = targets
          </div>
        </div>
        <Legend />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#f4f4f5" />
          <XAxis
            dataKey="sell_through_pct"
            type="number"
            domain={[0, 100]}
            tickFormatter={v => `${v}%`}
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
            axisLine={{ stroke: '#e4e4e7' }}
            tickLine={false}
            label={{ value: 'Sell-Through %', position: 'insideBottom', offset: -8, fill: '#71717a', fontSize: 10 }}
          />
          <YAxis
            dataKey="gross_margin_pct"
            type="number"
            domain={[0, 65]}
            tickFormatter={v => `${v}%`}
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
            axisLine={{ stroke: '#e4e4e7' }}
            tickLine={false}
            width={38}
            label={{ value: 'Margin %', angle: -90, position: 'insideLeft', offset: 12, fill: '#71717a', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <ReferenceLine x={58} stroke="#6366f1" strokeDasharray="3 3" strokeOpacity={0.5} strokeWidth={1.5} />
          <ReferenceLine y={55} stroke="#6366f1" strokeDasharray="3 3" strokeOpacity={0.5} strokeWidth={1.5} />
          <Scatter
            data={data}
            onClick={(d) => { const sku = d as unknown as SKU; onSelect(sku.sku_id === selectedId ? null : sku.sku_id) }}
            style={{ cursor: 'pointer' }}
          >
            {data.map(entry => {
              const c = DIAGNOSIS_COLORS[entry.ai_diagnosis]
              const isSelected = entry.sku_id === selectedId
              return (
                <Cell
                  key={entry.sku_id}
                  fill={c.chart}
                  fillOpacity={selectedId && !isSelected ? 0.15 : 0.7}
                  stroke={isSelected ? '#18181b' : c.chart}
                  strokeWidth={isSelected ? 2 : 0}
                />
              )
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

function Legend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 12px', justifyContent: 'flex-end', maxWidth: 280 }}>
      {DIAGNOSES.map(d => {
        const c = DIAGNOSIS_COLORS[d]
        return (
          <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#71717a' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.chart, flexShrink: 0 }} />
            {d}
          </div>
        )
      })}
    </div>
  )
}
