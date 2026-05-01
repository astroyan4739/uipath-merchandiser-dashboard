import { useState } from 'react'
import type { SKU, UrgencyLabel, AiDiagnosis } from '../data/types'
import { DIAGNOSIS_COLORS } from './DiagnosisBadge'
import { TriageModal } from './TriageModal'

interface TriageCardsProps {
  skus: SKU[]
  onSelectSku: (id: string) => void
}

const URGENCY_CONFIG: Record<UrgencyLabel, {
  label: string
  sub: string
  color: string
  bg: string
  border: string
}> = {
  Critical: {
    label: 'Critical',
    sub: 'Need intervention',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  OK: {
    label: 'On Track',
    sub: 'Within target range',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  Reorder: {
    label: 'Reorder Signal',
    sub: 'Exceeding velocity',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
}

function topDiagnosis(skus: SKU[]): AiDiagnosis | null {
  if (!skus.length) return null
  const counts: Partial<Record<AiDiagnosis, number>> = {}
  skus.forEach(s => { counts[s.ai_diagnosis] = (counts[s.ai_diagnosis] ?? 0) + 1 })
  return (Object.entries(counts) as [AiDiagnosis, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

export function TriageCards({ skus, onSelectSku }: TriageCardsProps) {
  const [openModal, setOpenModal] = useState<UrgencyLabel | null>(null)

  const groups: Record<UrgencyLabel, SKU[]> = {
    Critical: skus.filter(s => s.urgency_label === 'Critical'),
    OK:       skus.filter(s => s.urgency_label === 'OK'),
    Reorder:  skus.filter(s => s.urgency_label === 'Reorder'),
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {(Object.keys(URGENCY_CONFIG) as UrgencyLabel[]).map(label => {
          const cfg = URGENCY_CONFIG[label]
          const group = groups[label]
          const top = topDiagnosis(group)

          return (
            <button
              key={label}
              onClick={() => setOpenModal(label)}
              style={{
                background: '#fff',
                border: '1px solid #e4e4e7',
                borderRadius: 10,
                padding: '18px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#18181b', marginBottom: 2 }}>{cfg.label}</div>
                  <div style={{ fontSize: 11, color: '#a1a1aa' }}>{cfg.sub}</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: cfg.color, lineHeight: 1 }}>
                  {group.length}
                </div>
              </div>

              {top && (
                <div style={{
                  paddingTop: 12,
                  borderTop: '1px solid #f4f4f5',
                  fontSize: 11,
                  color: '#a1a1aa',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  marginBottom: 10,
                }}>
                  Top: <span style={{ color: DIAGNOSIS_COLORS[top].text, fontWeight: 500 }}>{top}</span>
                </div>
              )}

              <div style={{ fontSize: 11, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>↗</span> Click to explore data
              </div>
            </button>
          )
        })}
      </div>

      {openModal && (
        <TriageModal
          urgency={openModal}
          skus={groups[openModal]}
          onClose={() => setOpenModal(null)}
          onSelectSku={id => { onSelectSku(id); setOpenModal(null) }}
        />
      )}
    </>
  )
}
