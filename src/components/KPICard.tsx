import { useState, useRef, useEffect } from 'react'
import type { KPI } from '../data/shopifyData'
import { dataPeriodLabel } from '../data/shopifyData'

interface Props {
  kpi: KPI
  onTargetChange: (val: number) => void
  onExplore: () => void
}

const DEFAULT_PERIOD = { days: 30 }

function scale(kpi: KPI, days: number): { current: number; previous: number } {
  if (kpi.unit === '%') return { current: kpi.current, previous: kpi.previous }
  const f = days / 30
  return { current: kpi.current * f, previous: kpi.previous * f }
}

function formatValue(kpi: KPI, val: number): string {
  if (kpi.unit === '£') return `£${Math.round(val).toLocaleString('en-GB')}`
  if (kpi.unit === '%') return `${val.toFixed(1)}%`
  return Math.round(val).toLocaleString('en-GB')
}

export function KPICard({ kpi, onTargetChange, onExplore }: Props) {
  const [showInfo, setShowInfo] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showTargetInput, setShowTargetInput] = useState(false)
  const [targetDraft, setTargetDraft] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { current, previous } = scale(kpi, DEFAULT_PERIOD.days)
  const deltaPct = previous > 0 ? ((current - previous) / previous) * 100 : null
  const deltaUp = deltaPct !== null && deltaPct >= 0

  const target = kpi.target
  const targetPct = target !== undefined ? (current / target) * 100 : null
  const targetColor = targetPct === null ? '' : targetPct >= 100 ? '#22c55e' : targetPct >= 80 ? '#f59e0b' : '#ef4444'

  useEffect(() => {
    if (!showMenu) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  useEffect(() => {
    if (showTargetInput) inputRef.current?.focus()
  }, [showTargetInput])

  function openTargetInput() {
    setShowMenu(false)
    setTargetDraft(target !== undefined ? String(target) : '')
    setShowTargetInput(true)
  }

  function confirmTarget() {
    const val = parseFloat(targetDraft)
    if (!isNaN(val) && val > 0) onTargetChange(val)
    setShowTargetInput(false)
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '18px 20px',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
    }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        {/* Label + info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>{kpi.label}</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: '1px solid var(--border)',
                  background: showInfo ? 'var(--accent-bg)' : 'transparent',
                  color: showInfo ? 'var(--accent)' : 'var(--text-subtle)',
                  fontSize: 10, fontWeight: 700,
                  cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >i</button>
              {showInfo && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: '50%',
                  transform: 'translateX(-50%)', width: 240,
                  background: '#1e1e2e', color: '#e2e8f0',
                  borderRadius: 8, padding: '12px 14px',
                  fontSize: 11, lineHeight: 1.6,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 60, pointerEvents: 'none',
                }}>
                  <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid #1e1e2e' }} />
                  <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{kpi.label}</div>
                  <div style={{ marginBottom: 6 }}>{kpi.definition}</div>
                  <div style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 10, marginBottom: 4 }}>{kpi.formula}</div>
                  <div style={{ color: '#7dd3fc', fontSize: 10 }}>💡 {kpi.businessUse}</div>
                </div>
              )}
            </div>
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{dataPeriodLabel}</span>
        </div>

        {/* More menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(v => !v)}
            style={{
              width: 24, height: 24, borderRadius: 5,
              border: '1px solid var(--border)',
              background: showMenu ? 'var(--accent-bg)' : 'transparent',
              color: showMenu ? 'var(--accent)' : 'var(--text-subtle)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, letterSpacing: 1, lineHeight: 1,
            }}
          >···</button>

          {showMenu && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 55, minWidth: 150, overflow: 'hidden',
            }}>
              {[
                {
                  label: target !== undefined ? 'Edit target' : 'Set target',
                  icon: <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" fill="currentColor"/></svg>,
                  action: openTargetInput,
                },
                {
                  label: 'Explore data',
                  icon: <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                  action: () => { setShowMenu(false); onExplore() },
                },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width: '100%', textAlign: 'left', padding: '9px 14px',
                    border: 'none', background: 'none', fontSize: 12, color: 'var(--text)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Value */}
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {formatValue(kpi, current)}
      </div>

      {/* Delta badge */}
      {deltaPct !== null && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
            background: deltaUp ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: deltaUp ? '#16a34a' : '#dc2626',
          }}>
            {deltaUp ? '↑' : '↓'} {Math.abs(deltaPct).toFixed(1)}%
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>vs last month</span>
        </div>
      )}

      {/* Target threshold indicator */}
      {target !== undefined && targetPct !== null && (
        <div style={{ marginTop: 14 }}>
          {/* Track with threshold line */}
          <div style={{ position: 'relative', height: 4, background: 'var(--bg)', borderRadius: 2, overflow: 'visible', marginBottom: 6 }}>
            {/* Fill bar */}
            <div style={{
              height: '100%',
              width: `${Math.min(targetPct, 100)}%`,
              background: targetColor,
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }} />
            {/* Threshold line at 100% (= target) */}
            <div style={{
              position: 'absolute', top: -3, right: 0,
              width: 2, height: 10,
              background: 'var(--text-subtle)',
              borderRadius: 1,
            }} />
          </div>
          {/* Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: targetColor, fontWeight: 600 }}>
              {targetPct >= 100 ? '✓ Target met' : `${targetPct.toFixed(1)}% of target`}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>
              Target: {formatValue(kpi, target)}
            </span>
          </div>
        </div>
      )}

      {/* Set / Edit target input */}
      {showTargetInput && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
            {target !== undefined ? 'Edit target' : 'Set target'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              {kpi.unit === '£' && (
                <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}>£</span>
              )}
              <input
                ref={inputRef}
                type="number"
                value={targetDraft}
                onChange={e => setTargetDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmTarget(); if (e.key === 'Escape') setShowTargetInput(false) }}
                placeholder={kpi.unit === '%' ? 'e.g. 75' : kpi.unit === '£' ? 'e.g. 15000' : 'e.g. 100'}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: kpi.unit === '£' ? '5px 8px 5px 20px' : '5px 8px',
                  border: '1px solid var(--border)', borderRadius: 5,
                  fontSize: 12, background: 'var(--bg)', color: 'var(--text)',
                  outline: 'none',
                }}
              />
              {kpi.unit === '%' && (
                <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}>%</span>
              )}
            </div>
            <button
              onClick={confirmTarget}
              style={{
                width: 26, height: 26, borderRadius: 5, border: 'none',
                background: 'var(--accent)', color: '#fff',
                fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✓</button>
            <button
              onClick={() => setShowTargetInput(false)}
              style={{
                width: 26, height: 26, borderRadius: 5,
                border: '1px solid var(--border)', background: 'none',
                color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
          </div>
        </div>
      )}

    </div>
  )
}
