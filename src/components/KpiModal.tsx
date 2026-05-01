import { Dialog } from '@base-ui-components/react/dialog'
import type { HistoricalData } from '../data/historical'

interface KpiModalProps {
  metric: 'st' | 'margin'
  periodId: string
  periods: { id: string; label: string }[]
  historical: HistoricalData
  onClose: () => void
  onPeriodChange: (id: string) => void
}

const CATEGORIES = ['Outerwear', 'Knitwear', 'Denim', 'Accessories', 'Footwear']

const METRIC_LABELS = {
  st: { label: 'Sell-Through', unit: '%', field: 'st' as const },
  margin: { label: 'Gross Margin', unit: '%', field: 'margin' as const },
}

function delta(a: number, b: number) {
  return +(a - b).toFixed(1)
}

function DeltaCell({ value }: { value: number }) {
  const up = value > 0
  const zero = Math.abs(value) < 0.05
  return (
    <span style={{
      fontSize: 12,
      fontWeight: 600,
      color: zero ? '#a1a1aa' : up ? '#16a34a' : '#dc2626',
    }}>
      {zero ? '—' : `${up ? '▲ +' : '▼ '}${value}%`}
    </span>
  )
}

function MiniBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 80, height: 4, background: '#f4f4f5', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b', minWidth: 40 }}>{value.toFixed(1)}%</span>
    </div>
  )
}

export function KpiModal({ metric, periodId, periods, historical, onClose, onPeriodChange }: KpiModalProps) {
  const cfg = METRIC_LABELS[metric]
  const current = historical.current
  const snapshot = historical.snapshots.find(s => s.period_id === periodId)

  const portfolioCurrentVal = current.portfolio[cfg.field]
  const portfolioPrevVal = snapshot?.portfolio[cfg.field]
  const portfolioDelta = portfolioPrevVal !== undefined ? delta(portfolioCurrentVal, portfolioPrevVal) : null

  const color = metric === 'st' ? '#6366f1' : '#0ea5e9'

  return (
    <Dialog.Root open onOpenChange={open => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(2px)',
            zIndex: 60,
          }}
        />
        <Dialog.Popup
          style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 70,
            background: '#fff',
            border: '1px solid #e4e4e7',
            borderRadius: 14,
            width: 680,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100vh - 64px)',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            outline: 'none',
          }}
        >
          {/* Header */}
          <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid #f4f4f5' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: '#18181b', margin: 0, marginBottom: 4 }}>
                  {cfg.label} — Category Breakdown
                </Dialog.Title>
                <Dialog.Description style={{ fontSize: 12, color: '#a1a1aa', margin: 0 }}>
                  {current.display_date} vs {snapshot?.display_date ?? '—'}
                </Dialog.Description>
              </div>
              <Dialog.Close
                style={{
                  background: '#f4f4f5', border: 'none', borderRadius: 7,
                  color: '#71717a', cursor: 'pointer', padding: '6px 10px',
                  fontSize: 13, lineHeight: 1,
                }}
              >
                ✕
              </Dialog.Close>
            </div>

            {/* Period selector */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {periods.map(p => (
                <button
                  key={p.id}
                  onClick={() => onPeriodChange(p.id)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: periodId === p.id ? '#6366f1' : '#e4e4e7',
                    background: periodId === p.id ? '#eef2ff' : '#fff',
                    color: periodId === p.id ? '#6366f1' : '#71717a',
                    outline: 'none',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Portfolio summary row */}
          <div style={{
            margin: '0 26px',
            padding: '16px 0',
            borderBottom: '1px solid #f4f4f5',
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}>
            <div>
              <div style={{ fontSize: 10, color: '#a1a1aa', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Portfolio (now)</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#18181b', lineHeight: 1 }}>
                {portfolioCurrentVal.toFixed(1)}<span style={{ fontSize: 14, color: '#a1a1aa', fontWeight: 400 }}>%</span>
              </div>
            </div>
            {portfolioPrevVal !== undefined && (
              <>
                <div style={{ color: '#e4e4e7', fontSize: 24 }}>→</div>
                <div>
                  <div style={{ fontSize: 10, color: '#a1a1aa', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {snapshot?.display_date}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#71717a', lineHeight: 1 }}>
                    {portfolioPrevVal.toFixed(1)}<span style={{ fontSize: 14, color: '#a1a1aa', fontWeight: 400 }}>%</span>
                  </div>
                </div>
                {portfolioDelta !== null && (
                  <div style={{
                    marginLeft: 'auto',
                    background: portfolioDelta > 0 ? '#f0fdf4' : portfolioDelta < 0 ? '#fef2f2' : '#f4f4f5',
                    border: `1px solid ${portfolioDelta > 0 ? '#bbf7d0' : portfolioDelta < 0 ? '#fecaca' : '#e4e4e7'}`,
                    borderRadius: 8,
                    padding: '10px 16px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: portfolioDelta > 0 ? '#16a34a' : portfolioDelta < 0 ? '#dc2626' : '#a1a1aa' }}>
                      {portfolioDelta > 0 ? '+' : ''}{portfolioDelta}%
                    </div>
                    <div style={{ fontSize: 10, color: '#a1a1aa', marginTop: 2 }}>portfolio change</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Category table */}
          <div style={{ padding: '0 26px 24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr>
                  <Th>Category</Th>
                  <Th>Now</Th>
                  <Th>{snapshot?.display_date ?? '—'}</Th>
                  <Th>Change</Th>
                  <Th>vs Other metric</Th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((cat, i) => {
                  const currVal = current.by_category[cat]?.[cfg.field] ?? 0
                  const prevVal = snapshot?.by_category[cat]?.[cfg.field]
                  const d = prevVal !== undefined ? delta(currVal, prevVal) : null

                  const otherField = metric === 'st' ? 'margin' : 'st'
                  const otherLabel = metric === 'st' ? 'Margin' : 'ST'
                  const otherCurrVal = current.by_category[cat]?.[otherField] ?? 0
                  const otherPrevVal = snapshot?.by_category[cat]?.[otherField]
                  const otherDelta = otherPrevVal !== undefined ? delta(otherCurrVal, otherPrevVal) : null

                  return (
                    <tr key={cat} style={{ borderBottom: '1px solid #f9f9f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '12px 0', fontSize: 13, fontWeight: 500, color: '#18181b' }}>{cat}</td>
                      <td style={{ padding: '12px 0' }}>
                        <MiniBar value={currVal} color={color} />
                      </td>
                      <td style={{ padding: '12px 0' }}>
                        {prevVal !== undefined
                          ? <MiniBar value={prevVal} color="#d4d4d8" />
                          : <span style={{ color: '#a1a1aa', fontSize: 12 }}>—</span>
                        }
                      </td>
                      <td style={{ padding: '12px 0' }}>
                        {d !== null ? <DeltaCell value={d} /> : <span style={{ color: '#a1a1aa' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 0', fontSize: 12, color: '#71717a' }}>
                        {otherDelta !== null && (
                          <span>
                            {otherLabel}: <DeltaCell value={otherDelta} />
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div style={{ marginTop: 16, fontSize: 11, color: '#a1a1aa', lineHeight: 1.6 }}>
              {snapshot?.period_id === '90d' && (
                <span style={{ color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 5, padding: '3px 8px' }}>
                  ⚠ SS25 W11 is end-of-season clearance — high ST driven by markdown, not demand. Margin not comparable to in-season figures.
                </span>
              )}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: '8px 0',
      textAlign: 'left',
      fontSize: 11,
      fontWeight: 600,
      color: '#a1a1aa',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      borderBottom: '1px solid #f4f4f5',
    }}>
      {children}
    </th>
  )
}
