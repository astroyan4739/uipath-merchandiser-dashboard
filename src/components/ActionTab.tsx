import { useState, Fragment } from 'react'
import type { Product } from '../data/shopifyData'

interface Props {
  products: Product[]
}

interface ThoughtStep {
  id: string
  icon: string
  title: string
  body: string
  detail: React.ReactNode
}

const BUNDLE_SKUS = ['TOY494', 'TOY493', 'TOY492']
const POKEMON_SKUS = ['TOY500', 'TOY499', 'TOY482', 'TOY481', 'TOY495', 'TOY494', 'TOY493', 'TOY492']

// ── Step detail components ─────────────────────────────────────

function SignalDetail({ products }: { products: Product[] }) {
  const max = Math.max(...products.map(p => p.sellThrough))
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', marginBottom: 8 }}>
        Sell-through rate
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.map(p => {
          const st = Math.round(p.sellThrough * 100)
          return (
            <div key={p.sku}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500 }}>{p.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>{st}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${(p.sellThrough / max) * 100}%`, background: '#dc2626', borderRadius: 3 }} />
              </div>
              <div style={{ marginTop: 3 }}>
                <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{p.sold} sold / {p.sold + p.inventory} received · {p.daysInStock} days in stock</span>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 10, padding: '8px 10px', background: '#fef2f2', borderRadius: 6, fontSize: 11, color: '#dc2626' }}>
        At current velocity, all 3 SKUs will not clear before end of season.
      </div>
    </div>
  )
}

function PatternDetail({ allProducts }: { allProducts: Product[] }) {
  const pokemonProducts = allProducts.filter(p => POKEMON_SKUS.includes(p.sku))
  const sorted = [...pokemonProducts].sort((a, b) => b.sellThrough - a.sellThrough)
  const max = sorted[0].sellThrough

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', marginBottom: 8 }}>
        POKEMON SKU sell-through comparison
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {sorted.map(p => {
          const st = Math.round(p.sellThrough * 100)
          const isBundle = BUNDLE_SKUS.includes(p.sku)
          const isGiftSet = p.sku === 'TOY500'
          const barColor = isBundle ? '#dc2626' : isGiftSet ? '#7c3aed' : '#60a5fa'
          return (
            <div key={p.sku}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 140, fontSize: 10, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {p.name.replace('Pokemon ', '').replace('Kuu Kuu Harajuku ', '')}
                  {isGiftSet && <span style={{ marginLeft: 4, fontSize: 9, color: '#7c3aed', fontWeight: 600 }}>Gift Set</span>}
                  {isBundle && <span style={{ marginLeft: 4, fontSize: 9, color: '#dc2626', fontWeight: 600 }}>stagnant</span>}
                </div>
                <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(p.sellThrough / max) * 100}%`, background: barColor, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: barColor, minWidth: 30, textAlign: 'right' }}>{st}%</span>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 10, padding: '8px 10px', background: '#ede9fe', borderRadius: 6, fontSize: 11, color: '#6d28d9' }}>
        Gift Set (£33.55) outsells individual figures 4:1 in units — customers respond to set framing, not individual pricing.
      </div>
    </div>
  )
}

function StrategyDetail({ bundleProducts }: { bundleProducts: Product[] }) {
  const individualTotal = bundleProducts.reduce((s, p) => s + p.price, 0)
  const bundleCost = bundleProducts.reduce((s, p) => s + p.cost, 0)
  const bundlePrice = 17.99
  const markdownPrice = individualTotal * 0.5

  const rows = [
    { label: 'Price', individual: `£${individualTotal.toFixed(2)}`, bundle: `£${bundlePrice.toFixed(2)}`, markdown: `£${markdownPrice.toFixed(2)}` },
    { label: 'Cost', individual: `£${bundleCost.toFixed(2)}`, bundle: `£${bundleCost.toFixed(2)}`, markdown: `£${bundleCost.toFixed(2)}` },
    { label: 'Margin', individual: '40%', bundle: '30.1%', markdown: '20%' },
    { label: 'Transaction', individual: '3 sep. decisions', bundle: '1 decision', markdown: '3 sep. decisions' },
  ]

  const cols = [
    { key: 'individual', label: 'Individual', color: '#94a3b8', bg: 'var(--bg)' },
    { key: 'bundle', label: 'Bundle (rec.)', color: '#7c3aed', bg: '#ede9fe' },
    { key: 'markdown', label: '50% Markdown', color: '#dc2626', bg: '#fef2f2' },
  ]

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', marginBottom: 8 }}>
        Strategy comparison
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(3, 1fr)', gap: 1, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ background: 'var(--bg)', padding: '6px 8px' }} />
        {cols.map(c => (
          <div key={c.key} style={{ background: c.bg, padding: '6px 8px', textAlign: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: c.color }}>{c.label}</span>
          </div>
        ))}
        {/* Rows */}
        {rows.map((row, i) => (
          <Fragment key={i}>
            <div style={{ background: 'var(--bg)', padding: '6px 8px', fontSize: 10, color: 'var(--text-subtle)', fontWeight: 600, borderTop: '1px solid var(--border)' }}>
              {row.label}
            </div>
            {cols.map(c => (
              <div key={c.key} style={{ background: c.bg, padding: '6px 8px', textAlign: 'center', fontSize: 11, color: c.color, fontWeight: c.key === 'bundle' ? 700 : 400, borderTop: '1px solid var(--border)' }}>
                {row[c.key as keyof typeof row]}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
      <div style={{ marginTop: 10, padding: '8px 10px', background: '#ede9fe', borderRadius: 6, fontSize: 11, color: '#6d28d9' }}>
        10 bundles sold = £54.20 gross profit. Markdown alternative yields £31.20 with worse margin.
      </div>
    </div>
  )
}

function ImpactDetail({ bundleProducts }: { bundleProducts: Product[] }) {
  const projectedUnits = 12
  const projectedST = 40

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', marginBottom: 8 }}>
        Sell-through: current vs projected (2 weeks)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {bundleProducts.map(p => {
          const current = Math.round(p.sellThrough * 100)
          const projected = Math.min(projectedST, 100)
          return (
            <div key={p.sku}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500 }}>{p.name.replace('Pokemon ', '')}</span>
                <span style={{ fontSize: 11 }}>
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>{current}%</span>
                  <span style={{ color: 'var(--text-subtle)', margin: '0 4px' }}>{'-->'}</span>
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>~{projected}%</span>
                </span>
              </div>
              <div style={{ position: 'relative', height: 8, background: 'var(--border)', borderRadius: 4 }}>
                {/* Projected bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${projected}%`, background: 'rgba(34,197,94,0.2)', borderRadius: 4 }} />
                {/* Current bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${current}%`, background: '#dc2626', borderRadius: 4 }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Gross profit projection */}
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', marginBottom: 8 }}>
        Gross profit projection (10–14 bundles)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { label: 'Current trajectory', value: '£0', sub: 'no bundles sold', color: '#dc2626', bg: '#fef2f2' },
          { label: 'Conservative (×10)', value: '£54', sub: '30.1% margin', color: '#7c3aed', bg: '#ede9fe' },
          { label: 'Optimistic (×14)', value: '£76', sub: '30.1% margin', color: '#22c55e', bg: '#f0fdf4' },
        ].map(c => (
          <div key={c.label} style={{ padding: '10px 12px', background: c.bg, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 10, color: c.color, fontWeight: 500, marginTop: 2 }}>{c.label}</div>
            <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, padding: '8px 10px', background: '#fafafa', borderRadius: 6, fontSize: 11, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
        {'⚠'} Monitor Gift Set (TOY500) velocity. If it drops over 20%, pause bundle to avoid cannibalization.
      </div>
    </div>
  )
}

// ── ThoughtStepCard ────────────────────────────────────────────

function ThoughtStepCard({ step, isOpen, onToggle }: {
  step: ThoughtStep
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 8,
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', textAlign: 'left',
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '12px 16px',
          background: isOpen ? 'var(--accent-bg)' : 'var(--surface)',
          border: 'none', cursor: 'pointer',
          transition: 'background 0.15s',
        }}
      >
        <span style={{ fontSize: 14, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>{step.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: isOpen ? 'var(--accent)' : 'var(--text)' }}>
            {step.title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{step.body}</div>
        </div>
        <span style={{
          fontSize: 12, color: 'var(--text-subtle)',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          display: 'inline-block',
        }}>›</span>
      </button>
      {isOpen && (
        <div style={{
          padding: '14px 16px 16px',
          background: 'var(--bg)',
          borderTop: '1px solid var(--border)',
        }}>
          {step.detail}
        </div>
      )}
    </div>
  )
}

// ── BundleCard ─────────────────────────────────────────────────

function BundleCard({ bundleProducts, allProducts, onAdopt, onDismiss }: {
  bundleProducts: Product[]
  allProducts: Product[]
  onAdopt: () => void
  onDismiss: () => void
}) {
  const [openSteps, setOpenSteps] = useState<Set<string>>(new Set(['signal', 'pattern', 'strategy', 'impact']))

  const THOUGHT_STEPS: ThoughtStep[] = [
    {
      id: 'signal',
      icon: '📊',
      title: 'Data signals detected',
      body: '3 POKEMON single figures have been in stock 52 days with sell-through rates of 9–17%.',
      detail: <SignalDetail products={bundleProducts} />,
    },
    {
      id: 'pattern',
      icon: '🔍',
      title: 'Purchase pattern analysis',
      body: 'Customers who bought POKEMON battle sets show 3.2× higher browse rate on individual figures — but low conversion due to low perceived value.',
      detail: <PatternDetail allProducts={allProducts} />,
    },
    {
      id: 'strategy',
      icon: '💡',
      title: 'Strategy reasoning',
      body: 'Bundling 3 stagnant figures into a "Pokemon Collector Trio" at £17.99 creates a new price anchor while moving all three SKUs in a single transaction.',
      detail: <StrategyDetail bundleProducts={bundleProducts} />,
    },
    {
      id: 'impact',
      icon: '📈',
      title: 'Projected impact',
      body: 'Estimated 15–22pp lift in sell-through for these 3 SKUs within 2 weeks. Gross profit impact: +£54 vs. current trajectory of £0.',
      detail: <ImpactDetail bundleProducts={bundleProducts} />,
    },
  ]

  const toggleStep = (id: string) => {
    setOpenSteps(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const bundlePrice = 17.99
  const individualTotal = bundleProducts.reduce((sum, p) => sum + p.price, 0)
  const bundleCost = bundleProducts.reduce((sum, p) => sum + p.cost, 0)
  const bundleMargin = ((bundlePrice - bundleCost) / bundlePrice * 100).toFixed(1)
  const discount = (((individualTotal - bundlePrice) / individualTotal) * 100).toFixed(0)

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
    }}>
      {/* Card header */}
      <div style={{
        padding: '18px 24px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(135deg, #fafafa 0%, #f4f0ff 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'var(--accent)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                Bundle stagnant POKEMON singles into a Collector Trio
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600,
                padding: '2px 8px', borderRadius: 12,
                background: '#ede9fe', color: '#7c3aed',
              }}>Bundle Strategy</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              3 products · 9–17% sell-through · 52 days in stock · Projected +33 units cleared
            </div>
          </div>
          {/* High confidence badge — right aligned */}
          <span style={{
            fontSize: 11, fontWeight: 600, flexShrink: 0,
            padding: '2px 10px', borderRadius: 12,
            background: 'rgba(34,197,94,0.12)', color: '#16a34a',
          }}>High confidence</span>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Products involved */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', marginBottom: 10 }}>
            Products in Bundle
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {bundleProducts.map(p => (
              <div key={p.sku} style={{
                flex: 1,
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 12px',
                background: 'var(--bg)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginBottom: 6 }}>{p.sku}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>£{p.price.toFixed(2)}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    padding: '1px 5px', borderRadius: 3,
                    background: '#fef2f2', color: '#dc2626',
                  }}>{Math.round(p.sellThrough * 100)}% ST</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bundle price summary */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            marginTop: 12,
            padding: '10px 14px',
            background: '#ede9fe',
            borderRadius: 8,
            fontSize: 12,
          }}>
            <div>
              <span style={{ color: '#6d28d9', fontWeight: 500 }}>Bundle price: </span>
              <span style={{ fontWeight: 700, color: '#4c1d95', fontSize: 14 }}>£{bundlePrice.toFixed(2)}</span>
            </div>
            <div style={{ color: '#7c3aed' }}>vs £{individualTotal.toFixed(2)} individually ({discount}% off)</div>
            <div style={{ marginLeft: 'auto', color: '#6d28d9' }}>
              Margin: <strong>{bundleMargin}%</strong>
            </div>
          </div>
        </div>

        {/* Chain of Thought section */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Why did AI make this decision?</div>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 1 }}>
              Understand why this recommendation was made before deciding. <span style={{ fontStyle: 'italic' }}>AI can make mistakes. Please double-check before adopting the strategy.</span>
            </div>
          </div>

          {/* Expandable thought steps */}
          {THOUGHT_STEPS.map(step => (
            <ThoughtStepCard
              key={step.id}
              step={step}
              isOpen={openSteps.has(step.id)}
              onToggle={() => toggleStep(step.id)}
            />
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            onClick={onDismiss}
            style={{
              padding: '6px 14px', borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-muted)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
          <button
            onClick={onAdopt}
            style={{
              padding: '6px 14px', borderRadius: 6, border: 'none',
              background: 'var(--accent)', color: '#fff',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Adopt Strategy
          </button>
        </div>
      </div>
    </div>
  )
}

export function ActionTab({ products }: Props) {
  const bundleProducts = products.filter(p => BUNDLE_SKUS.includes(p.sku))
  const [adopted, setAdopted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        {/* Section header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>AI Actions</h2>
            <span style={{
              fontSize: 10, fontWeight: 600,
              padding: '2px 6px', borderRadius: 4,
              background: 'var(--accent-bg)', color: 'var(--accent)',
            }}>Beta</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Recommendations are generated from your inventory and sales data. Each recommendation shows the AI's full reasoning chain — read before you decide.
          </p>
        </div>

        {adopted && (
          <div style={{
            padding: '14px 18px', marginBottom: 16,
            background: '#f0fdf4', borderRadius: 10,
            border: '1px solid #bbf7d0',
            fontSize: 13, color: '#166534', fontWeight: 500,
          }}>
            ✅ Strategy adopted. Bundle "Pokemon Collector Trio" marked for implementation.
          </div>
        )}

        {dismissed && (
          <div style={{
            padding: '14px 18px', marginBottom: 16,
            background: 'var(--bg)', borderRadius: 10,
            border: '1px solid var(--border)',
            fontSize: 13, color: 'var(--text-muted)',
          }}>
            Recommendation dismissed. AI will not resurface this for 14 days.
          </div>
        )}

        {!adopted && !dismissed && (
          <BundleCard
            bundleProducts={bundleProducts}
            allProducts={products}
            onAdopt={() => setAdopted(true)}
            onDismiss={() => setDismissed(true)}
          />
        )}

        {(adopted || dismissed) && (
          <div style={{
            marginTop: 16,
            padding: '32px',
            background: 'var(--surface)',
            border: '1px dashed var(--border)',
            borderRadius: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 }}>
              No more pending actions
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
              AI will analyse your data and surface new recommendations as patterns emerge.
            </div>
          </div>
        )}
    </div>
  )
}
