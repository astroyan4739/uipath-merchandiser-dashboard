import { useState } from 'react'
import { Dialog } from '@base-ui-components/react/dialog'
import type { SKU, UrgencyLabel } from '../data/types'
import { DiagnosisBadge, UrgencyBadge, URGENCY_COLORS, DIAGNOSIS_COLORS } from './DiagnosisBadge'

interface TriageModalProps {
  urgency: UrgencyLabel
  skus: SKU[]
  onClose: () => void
  onSelectSku: (id: string) => void
}

const URGENCY_TITLES: Record<UrgencyLabel, { label: string; sub: string }> = {
  Critical:  { label: 'Critical SKUs', sub: 'These products need immediate intervention' },
  OK:        { label: 'On Track SKUs', sub: 'Within sell-through target range' },
  Reorder:   { label: 'Reorder Signals', sub: 'Exceeding velocity targets — consider replenishment' },
}

type SortKey = 'product_name' | 'category' | 'sell_through_pct' | 'st_gap' | 'gross_margin_pct' | 'days_since_last_markdown' | 'weeks_of_supply'

export function TriageModal({ urgency, skus, onClose, onSelectSku }: TriageModalProps) {
  const [sortKey, setSortKey] = useState<SortKey>('st_gap')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const c = URGENCY_COLORS[urgency]
  const cfg = URGENCY_TITLES[urgency]
  const filtered = [...skus].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey]
    if (typeof av === 'string' && typeof bv === 'string')
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av)
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortTh = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      onClick={() => handleSort(col)}
      style={{
        padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600,
        color: sortKey === col ? '#18181b' : '#a1a1aa',
        letterSpacing: '0.04em', textTransform: 'uppercase',
        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
        borderBottom: '1px solid #f4f4f5', background: '#fafafa',
      }}
    >
      {label}{sortKey === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
    </th>
  )

  return (
    <Dialog.Root open onOpenChange={open => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(2px)',
          zIndex: 60,
        }} />
        <Dialog.Popup style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 70,
          background: '#fff',
          border: `1px solid ${c.border}`,
          borderRadius: 14,
          width: 820,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vh - 64px)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          outline: 'none',
        }}>
          {/* Header */}
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f4f4f5', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <UrgencyBadge label={urgency} />
                  <Dialog.Title style={{ fontSize: 15, fontWeight: 700, color: '#18181b', margin: 0 }}>
                    {cfg.label}
                  </Dialog.Title>
                  <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>({filtered.length})</span>
                </div>
                <Dialog.Description style={{ fontSize: 12, color: '#a1a1aa', margin: 0 }}>
                  {cfg.sub} · Click a row to inspect full SKU detail
                </Dialog.Description>
              </div>
              <Dialog.Close style={{
                background: '#f4f4f5', border: 'none', borderRadius: 7,
                color: '#71717a', cursor: 'pointer', padding: '6px 10px',
                fontSize: 13, lineHeight: 1, flexShrink: 0,
              }}>✕</Dialog.Close>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <SortTh col="product_name" label="Product" />
                  <SortTh col="category" label="Category" />
                  <SortTh col="sell_through_pct" label="ST %" />
                  <SortTh col="st_gap" label="vs Target" />
                  <SortTh col="gross_margin_pct" label="Margin" />
                  <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.04em', textTransform: 'uppercase', borderBottom: '1px solid #f4f4f5', background: '#fafafa' }}>Diagnosis</th>
                  <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.04em', textTransform: 'uppercase', borderBottom: '1px solid #f4f4f5', background: '#fafafa' }}>Action</th>
                  <SortTh col="days_since_last_markdown" label="Days No MD" />
                  <SortTh col="weeks_of_supply" label="WoS" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((sku, i) => {
                  const dc = DIAGNOSIS_COLORS[sku.ai_diagnosis]
                  return (
                    <tr
                      key={sku.sku_id}
                      onClick={() => { onSelectSku(sku.sku_id); onClose() }}
                      style={{
                        background: i % 2 === 0 ? '#fff' : '#fafafa',
                        borderBottom: '1px solid #f4f4f5',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f5f3ff')}
                      onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}
                    >
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 500, color: '#18181b' }}>{sku.product_name}</div>
                        <div style={{ fontSize: 10, color: '#a1a1aa', marginTop: 1 }}>{sku.sku_id}</div>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#71717a' }}>{sku.category}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 48, height: 3, background: '#f4f4f5', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(sku.sell_through_pct, 100)}%`, height: '100%', background: sku.sell_through_pct >= sku.st_target_pct ? '#22c55e' : sku.sell_through_pct >= sku.st_target_pct - 15 ? '#f59e0b' : '#ef4444', borderRadius: 2 }} />
                          </div>
                          <span style={{ fontWeight: 600, color: '#18181b' }}>{sku.sell_through_pct.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: sku.st_gap >= 0 ? '#16a34a' : '#dc2626' }}>
                        {sku.st_gap >= 0 ? '+' : ''}{sku.st_gap.toFixed(1)}%
                      </td>
                      <td style={{ padding: '10px 14px', color: sku.gross_margin_pct >= 50 ? '#18181b' : '#b45309', fontWeight: 500 }}>
                        {sku.gross_margin_pct.toFixed(1)}%
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <DiagnosisBadge diagnosis={sku.ai_diagnosis} size="sm" />
                      </td>
                      <td style={{ padding: '10px 14px', color: dc.text, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {sku.recommended_action}
                      </td>
                      <td style={{ padding: '10px 14px', color: sku.days_since_last_markdown > 30 ? '#dc2626' : '#a1a1aa', fontWeight: sku.days_since_last_markdown > 30 ? 600 : 400 }}>
                        {sku.days_since_last_markdown > 0 ? `${sku.days_since_last_markdown}d` : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', color: sku.weeks_of_supply > 10 ? '#b45309' : '#71717a' }}>
                        {sku.weeks_of_supply.toFixed(1)}w
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
