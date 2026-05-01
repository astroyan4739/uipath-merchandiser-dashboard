import { useState, useRef, useEffect } from 'react'
import type { Product } from '../data/shopifyData'

interface Config {
  title: string
  getValue: (p: Product) => number
  format: (v: number) => string
  barColor: (v: number, max: number) => string
}

const CONFIGS: Record<string, Config> = {
  revenue: {
    title: 'Total sales by product',
    getValue: p => p.price * p.sold,
    format: v => `£${v.toLocaleString('en-GB')}`,
    barColor: () => '#60a5fa',
  },
  sellThrough: {
    title: 'Products by sell-through rate',
    getValue: p => p.sellThrough * 100,
    format: v => `${v.toFixed(1)}%`,
    barColor: () => '#7c3aed',
  },
  grossMargin: {
    title: 'Products by gross margin',
    getValue: p => p.grossMargin * 100,
    format: v => `${v.toFixed(1)}%`,
    barColor: () => '#1e3a5f',
  },
}

interface Props {
  products: Product[]
  metric: 'revenue' | 'sellThrough' | 'grossMargin'
  onExplore?: (title: string) => void
}

export function SalesRanking({ products, metric, onExplore }: Props) {
  const [view, setView] = useState<'top' | 'bottom'>('top')
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const cfg = CONFIGS[metric]

  useEffect(() => {
    if (!showMenu) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  const sorted = [...products]
    .map(p => ({ ...p, _val: cfg.getValue(p) }))
    .sort((a, b) => b._val - a._val)

  const displayed = view === 'top' ? sorted.slice(0, 5) : sorted.slice(-5).reverse()
  const max = sorted[0]._val

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'var(--text)',
          flex: 1, minWidth: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {cfg.title}
        </div>

        {/* Top/Bottom toggle */}
        <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 6, padding: 2, gap: 2, flexShrink: 0 }}>
          {(['top', 'bottom'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '4px 10px',
                border: 'none', borderRadius: 4,
                fontSize: 11, fontWeight: 500,
                cursor: 'pointer',
                background: view === v ? 'var(--surface)' : 'transparent',
                color: view === v ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: view === v ? 'var(--shadow-sm)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {v === 'top' ? '↑ Top 5' : '↓ Bottom 5'}
            </button>
          ))}
        </div>

        {/* More menu */}
        {onExplore && (
          <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
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
                <button
                  onClick={() => { setShowMenu(false); onExplore(cfg.title) }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '9px 14px',
                    border: 'none', background: 'none', fontSize: 12, color: 'var(--text)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Explore data
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px dashed var(--border)', marginBottom: 16 }} />

      {metric === 'grossMargin' && (
        <div style={{ marginBottom: 10, fontSize: 11, color: 'var(--text-subtle)', fontStyle: 'italic' }}>
          Gross margin is uniform across all SKUs — cost is derived at 60% of price.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {displayed.map(p => (
          <div key={p.sku}>
            <div style={{
              fontSize: 12, color: 'var(--text)', marginBottom: 5,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {p.name} · {p.vendor}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(p._val / max) * 100}%`,
                  background: cfg.barColor(p._val, max),
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', minWidth: 44, textAlign: 'right' }}>
                {cfg.format(p._val)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
