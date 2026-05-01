import type { KPI } from '../data/shopifyData'

interface Props {
  all: KPI[]
  activeIds: string[]
  onChange: (ids: string[]) => void
  targets: Record<string, number>
  onTargetChange: (id: string, val: number) => void
}

export function CustomizePanel({ all, activeIds, onChange, targets, onTargetChange }: Props) {
  const toggle = (id: string) => {
    if (activeIds.includes(id)) {
      if (activeIds.length <= 1) return
      onChange(activeIds.filter(x => x !== id))
    } else {
      onChange([...activeIds, id])
    }
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '16px 20px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
        Customize Dashboard — select metrics to display
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
        {all.map(kpi => {
          const active = activeIds.includes(kpi.id)
          const hasTarget = targets[kpi.id] !== undefined || kpi.target !== undefined
          return (
            <div
              key={kpi.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 8,
                background: active ? 'var(--accent-bg)' : 'var(--bg)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div
                onClick={() => toggle(kpi.id)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'var(--accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {active && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: active ? 'var(--accent)' : 'var(--text)' }}>
                    {kpi.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>
                    {kpi.unit === '£' ? `£${kpi.current.toLocaleString()}` : kpi.unit === '%' ? `${kpi.current.toFixed(1)}%` : kpi.current}
                  </div>
                </div>
              </div>

              {/* Inline target input */}
              {active && !kpi.noTarget && (kpi.unit === '%' || kpi.unit === '£') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Target</span>
                  <input
                    type="number"
                    defaultValue={targets[kpi.id] ?? kpi.target ?? ''}
                    onBlur={e => {
                      const v = parseFloat(e.target.value)
                      if (!isNaN(v)) onTargetChange(kpi.id, v)
                    }}
                    style={{
                      width: 48, padding: '2px 4px',
                      border: '1px solid var(--border)',
                      borderRadius: 4, fontSize: 11,
                      outline: 'none',
                    }}
                  />
                  {hasTarget && <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{kpi.unit}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 10 }}>
        Minimum 1 metric required. Changes are saved automatically.
      </div>
    </div>
  )
}
