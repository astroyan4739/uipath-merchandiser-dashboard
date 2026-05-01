import { useState } from 'react'
import type { HistoricalData, PeriodSnapshot } from '../data/historical'
import { KpiModal } from './KpiModal'

interface KpiCardsProps {
  historical: HistoricalData
}

const ST_PERIODS = [
  { id: 'LY', label: 'Same season LY' },
]

const MARGIN_PERIODS = [
  { id: '30d',  label: '30d' },
  { id: '60d',  label: '60d' },
  { id: 'LY',   label: 'Same season LY' },
]

function delta(current: number, previous: number) {
  return +(current - previous).toFixed(1)
}

function DeltaTag({ value, unit = '%' }: { value: number; unit?: string }) {
  const up = value > 0
  const zero = value === 0
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      fontSize: 12,
      fontWeight: 600,
      color: zero ? '#a1a1aa' : up ? '#16a34a' : '#dc2626',
      background: zero ? '#f4f4f5' : up ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${zero ? '#e4e4e7' : up ? '#bbf7d0' : '#fecaca'}`,
      borderRadius: 20,
      padding: '2px 8px',
    }}>
      {zero ? '—' : up ? `▲ +${value}${unit}` : `▼ ${value}${unit}`}
    </span>
  )
}

function PeriodChips({
  selected,
  onChange,
  periods,
}: {
  selected: string
  onChange: (id: string) => void
  periods: { id: string; label: string }[]
}) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {periods.map(p => (
        <button
          key={p.id}
          onClick={e => { e.stopPropagation(); onChange(p.id) }}
          style={{
            padding: '2px 8px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
            border: '1px solid',
            transition: 'all 0.12s',
            borderColor: selected === p.id ? '#6366f1' : '#e4e4e7',
            background: selected === p.id ? '#eef2ff' : '#fff',
            color: selected === p.id ? '#6366f1' : '#71717a',
            outline: 'none',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

export function KpiCards({ historical }: KpiCardsProps) {
  const [stPeriod, setStPeriod] = useState('LY')
  const [mgPeriod, setMgPeriod] = useState('LY')
  const [modalMetric, setModalMetric] = useState<'st' | 'margin' | null>(null)
  const [modalPeriod, setModalPeriod] = useState<string>('LY')

  const current = historical.current
  const getSnapshot = (id: string): PeriodSnapshot | undefined =>
    historical.snapshots.find(s => s.period_id === id)

  const stSnap = getSnapshot(stPeriod)
  const mgSnap = getSnapshot(mgPeriod)

  const stDelta = stSnap ? delta(current.portfolio.st, stSnap.portfolio.st) : null
  const mgDelta = mgSnap ? delta(current.portfolio.margin, mgSnap.portfolio.margin) : null

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* ST% card */}
        <div
          onClick={() => { setModalMetric('st'); setModalPeriod(stPeriod) }}
          style={{
            background: '#fff',
            border: '1px solid #e4e4e7',
            borderRadius: 10,
            padding: '20px 22px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
                Sell-Through Rate
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: '#18181b', lineHeight: 1 }}>
                  {current.portfolio.st.toFixed(1)}
                </span>
                <span style={{ fontSize: 16, color: '#a1a1aa', fontWeight: 500 }}>%</span>
              </div>
              <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>
                {current.date_range ?? current.display_date}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {stDelta !== null && <DeltaTag value={stDelta} />}
              <div style={{ fontSize: 10, color: '#a1a1aa', marginTop: 6 }}>vs {stSnap?.label}</div>
            </div>
          </div>

          <PeriodChips selected={stPeriod} onChange={setStPeriod} periods={ST_PERIODS} />

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f4f4f5', fontSize: 11, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#6366f1', fontSize: 12 }}>↗</span>
            Click to explore category breakdown
          </div>
        </div>

        {/* Margin% card */}
        <div
          onClick={() => { setModalMetric('margin'); setModalPeriod(mgPeriod) }}
          style={{
            background: '#fff',
            border: '1px solid #e4e4e7',
            borderRadius: 10,
            padding: '20px 22px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
                Gross Margin
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: '#18181b', lineHeight: 1 }}>
                  {current.portfolio.margin.toFixed(1)}
                </span>
                <span style={{ fontSize: 16, color: '#a1a1aa', fontWeight: 500 }}>%</span>
              </div>
              <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>
                {current.date_range ?? current.display_date}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {mgDelta !== null && <DeltaTag value={mgDelta} />}
              <div style={{ fontSize: 10, color: '#a1a1aa', marginTop: 6 }}>vs {mgSnap?.label}</div>
            </div>
          </div>

          <PeriodChips selected={mgPeriod} onChange={setMgPeriod} periods={MARGIN_PERIODS} />

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f4f4f5', fontSize: 11, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#6366f1', fontSize: 12 }}>↗</span>
            Click to explore category breakdown
          </div>
        </div>
      </div>

      {modalMetric && (
        <KpiModal
          metric={modalMetric}
          periodId={modalPeriod}
          periods={modalMetric === 'st' ? ST_PERIODS : MARGIN_PERIODS}
          historical={historical}
          onClose={() => setModalMetric(null)}
          onPeriodChange={setModalPeriod}
        />
      )}
    </>
  )
}
