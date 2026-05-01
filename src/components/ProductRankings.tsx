import { useState } from 'react'
import type { Product } from '../data/shopifyData'

interface Props {
  products: Product[]
}

function STBar({ value, target = 0.8 }: { value: number; target?: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 60 ? '#22c55e' : pct >= 30 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--bg)', borderRadius: 2, position: 'relative' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 2, transition: 'width 0.3s',
        }} />
        {/* Target marker */}
        <div style={{
          position: 'absolute', top: -2, left: `${Math.round(target * 100)}%`,
          width: 1, height: 8, background: '#6366f1', transform: 'translateX(-50%)',
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 32, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

function ProductRow({ product, rank, onClick }: { product: Product; rank?: number; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '20px 1fr 80px 80px 80px',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600 }}>
        {rank !== undefined ? `#${rank}` : ''}
      </span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 1 }}>{product.vendor} · {product.sku}</div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        £{product.price.toFixed(2)}
      </div>
      <div>
        <STBar value={product.sellThrough} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
        {product.sold} sold / {product.inventory} left
      </div>
    </div>
  )
}

function DetailPanel({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '16px 20px',
      marginTop: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{product.name}</div>
        <button
          onClick={onClose}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}
        >×</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Units Sold', value: product.sold },
          { label: 'On Hand', value: product.inventory },
          { label: 'Days in Stock', value: `${product.daysInStock}d` },
          { label: 'Sell-Through', value: `${Math.round(product.sellThrough * 100)}%` },
          { label: 'Price', value: `£${product.price.toFixed(2)}` },
          { label: 'Cost', value: `£${product.cost.toFixed(2)}` },
          { label: 'Gross Margin', value: `${Math.round(product.grossMargin * 100)}%` },
          { label: 'Revenue', value: `£${(product.price * product.sold).toFixed(0)}` },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProductRankings({ products }: Props) {
  const [view, setView] = useState<'top' | 'bottom'>('top')
  const [selectedSku, setSelectedSku] = useState<string | null>(null)

  const sorted = [...products].sort((a, b) => b.sellThrough - a.sellThrough)
  const top5 = sorted.slice(0, 5)
  const bottom5 = sorted.slice(-5).reverse()
  const displayed = view === 'top' ? top5 : bottom5

  const selectedProduct = products.find(p => p.sku === selectedSku) ?? null

  const toggleSelect = (sku: string) => {
    setSelectedSku(prev => prev === sku ? null : sku)
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Products by Sell-Through Rate</div>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>
            Click any row to see details — target marker at 80%
          </div>
        </div>
        <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 6, padding: 2, gap: 2 }}>
          {(['top', 'bottom'] as const).map(v => (
            <button
              key={v}
              onClick={() => { setView(v); setSelectedSku(null) }}
              style={{
                padding: '4px 12px',
                border: 'none',
                borderRadius: 4,
                fontSize: 11, fontWeight: 500,
                cursor: 'pointer',
                background: view === v ? 'var(--surface)' : 'transparent',
                color: view === v ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: view === v ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {v === 'top' ? '↑ Top 5' : '↓ Bottom 5'}
            </button>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '20px 1fr 80px 80px 80px',
        gap: 12,
        padding: '0 0 8px',
        borderBottom: '2px solid var(--border)',
      }}>
        {['', 'Product', 'Price', 'Sell-Through', 'Inventory'].map(h => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {h}
          </span>
        ))}
      </div>

      {displayed.map((product, i) => (
        <div key={product.sku}>
          <ProductRow
            product={product}
            rank={view === 'top' ? i + 1 : bottom5.length - i}
            onClick={() => toggleSelect(product.sku)}
          />
          {selectedSku === product.sku && selectedProduct && (
            <DetailPanel product={selectedProduct} onClose={() => setSelectedSku(null)} />
          )}
        </div>
      ))}
    </div>
  )
}
