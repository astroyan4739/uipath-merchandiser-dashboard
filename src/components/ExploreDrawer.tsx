import { useState } from 'react'
import { products } from '../data/shopifyData'
import type { KPI, Product } from '../data/shopifyData'

interface Props {
  kpi: KPI
  onClose: () => void
}

interface ColDef {
  key: string
  label: string
  align?: 'right'
  format: (row: Record<string, unknown>) => string
  isKey?: boolean
  defaultDesc?: boolean
}

interface DimConfig {
  subtitle: string
  summaryStats: (kpi: KPI) => { label: string; value: string }[]
  cols: ColDef[]
  rows: () => Record<string, unknown>[]
  defaultSort: string
}

function pct(n: number) { return `${n.toFixed(1)}%` }
function gbp(n: number) { return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 0 })}` }

const DIMENSIONS: Record<string, DimConfig> = {
  gross_sales: {
    subtitle: 'Revenue = Units Sold × Unit Price, summed across all SKUs',
    summaryStats: kpi => [
      { label: 'Total Revenue', value: gbp(kpi.current) },
      { label: 'SKUs', value: String(products.length) },
      { label: 'Top SKU share', value: pct((Math.max(...products.map(p => p.price * p.sold)) / kpi.current) * 100) },
    ],
    cols: [
      { key: 'rank',    label: '#',           format: r => String(r.rank) },
      { key: 'name',    label: 'Product',      format: r => String(r.name), isKey: true },
      { key: 'sku',     label: 'SKU',          format: r => String(r.sku) },
      { key: 'price',   label: 'Unit Price',   align: 'right', format: r => gbp(r.price as number), defaultDesc: true },
      { key: 'sold',    label: 'Units Sold',   align: 'right', format: r => String(r.sold), defaultDesc: true },
      { key: 'revenue', label: 'Revenue',      align: 'right', format: r => gbp(r.revenue as number), defaultDesc: true },
      { key: 'share',   label: '% of Total',  align: 'right', format: r => pct(r.share as number), defaultDesc: true },
    ],
    rows: () => {
      const total = products.reduce((s, p) => s + p.price * p.sold, 0)
      return products.map(p => ({
        name: p.name, sku: p.sku, price: p.price, sold: p.sold,
        revenue: p.price * p.sold, share: (p.price * p.sold / total) * 100,
      }))
    },
    defaultSort: 'revenue',
  },

  orders: {
    subtitle: 'Order count = units sold per SKU (each unit counts as one line item)',
    summaryStats: kpi => [
      { label: 'Total Orders', value: String(kpi.current) },
      { label: 'SKUs', value: String(products.length) },
      { label: 'Avg per SKU', value: (kpi.current / products.length).toFixed(1) },
    ],
    cols: [
      { key: 'rank',  label: '#',           format: r => String(r.rank) },
      { key: 'name',  label: 'Product',      format: r => String(r.name), isKey: true },
      { key: 'sku',   label: 'SKU',          format: r => String(r.sku) },
      { key: 'sold',  label: 'Units Sold',   align: 'right', format: r => String(r.sold), defaultDesc: true },
      { key: 'share', label: '% of Total',  align: 'right', format: r => pct(r.share as number), defaultDesc: true },
    ],
    rows: () => {
      const total = products.reduce((s, p) => s + p.sold, 0)
      return products.map(p => ({ name: p.name, sku: p.sku, sold: p.sold, share: (p.sold / total) * 100 }))
    },
    defaultSort: 'sold',
  },

  sell_through: {
    subtitle: 'Sell-Through = Units Sold ÷ (Units Sold + On-Hand Inventory)',
    summaryStats: () => {
      const totalSold = products.reduce((s, p) => s + p.sold, 0)
      const totalOnHand = products.reduce((s, p) => s + p.inventory, 0)
      return [
        { label: 'Total Units Sold', value: String(totalSold) },
        { label: 'Total On-Hand', value: String(totalOnHand) },
        { label: 'Total Units', value: String(totalSold + totalOnHand) },
      ]
    },
    cols: [
      { key: 'rank',   label: '#',              format: r => String(r.rank) },
      { key: 'name',   label: 'Product',         format: r => String(r.name), isKey: true },
      { key: 'sku',    label: 'SKU',             format: r => String(r.sku) },
      { key: 'sold',   label: 'Units Sold',      align: 'right', format: r => String(r.sold), defaultDesc: true },
      { key: 'onHand', label: 'On-Hand',         align: 'right', format: r => String(r.onHand), defaultDesc: true },
      { key: 'total',  label: 'Total Units',     align: 'right', format: r => String(r.total), defaultDesc: true },
      { key: 'st',     label: 'Sell-Through',    align: 'right', format: r => pct(r.st as number), defaultDesc: true },
    ],
    rows: () => products.map(p => ({
      name: p.name, sku: p.sku, sold: p.sold, onHand: p.inventory,
      total: p.sold + p.inventory, st: p.sellThrough * 100,
    })),
    defaultSort: 'st',
  },

  gross_margin: {
    subtitle: 'Gross Margin = (Revenue − COGS) ÷ Revenue',
    summaryStats: () => {
      const rev = products.reduce((s, p) => s + p.price * p.sold, 0)
      const cogs = products.reduce((s, p) => s + p.cost * p.sold, 0)
      return [
        { label: 'Total Revenue', value: gbp(rev) },
        { label: 'Total COGS', value: gbp(cogs) },
        { label: 'Gross Profit', value: gbp(rev - cogs) },
      ]
    },
    cols: [
      { key: 'rank',   label: '#',            format: r => String(r.rank) },
      { key: 'name',   label: 'Product',       format: r => String(r.name), isKey: true },
      { key: 'sku',    label: 'SKU',           format: r => String(r.sku) },
      { key: 'revenue',label: 'Revenue',       align: 'right', format: r => gbp(r.revenue as number), defaultDesc: true },
      { key: 'cogs',   label: 'COGS',          align: 'right', format: r => gbp(r.cogs as number), defaultDesc: true },
      { key: 'profit', label: 'Gross Profit',  align: 'right', format: r => gbp(r.profit as number), defaultDesc: true },
      { key: 'margin', label: 'Margin %',      align: 'right', format: r => pct(r.margin as number), defaultDesc: true },
    ],
    rows: () => products.map(p => {
      const revenue = p.price * p.sold
      const cogs = p.cost * p.sold
      return { name: p.name, sku: p.sku, revenue, cogs, profit: revenue - cogs, margin: p.grossMargin * 100 }
    }),
    defaultSort: 'margin',
  },

  avg_order_value: {
    subtitle: 'AOV = Gross Sales ÷ Orders; here shown as unit price × volume contribution',
    summaryStats: kpi => {
      const totalRev = products.reduce((s, p) => s + p.price * p.sold, 0)
      const totalSold = products.reduce((s, p) => s + p.sold, 0)
      return [
        { label: 'Avg Order Value', value: gbp(kpi.current) },
        { label: 'Total Revenue', value: gbp(totalRev) },
        { label: 'Total Units', value: String(totalSold) },
      ]
    },
    cols: [
      { key: 'rank',    label: '#',           format: r => String(r.rank) },
      { key: 'name',    label: 'Product',      format: r => String(r.name), isKey: true },
      { key: 'sku',     label: 'SKU',          format: r => String(r.sku) },
      { key: 'price',   label: 'Unit Price',   align: 'right', format: r => gbp(r.price as number), defaultDesc: true },
      { key: 'sold',    label: 'Units Sold',   align: 'right', format: r => String(r.sold), defaultDesc: true },
      { key: 'revenue', label: 'Revenue',      align: 'right', format: r => gbp(r.revenue as number), defaultDesc: true },
    ],
    rows: () => products.map(p => ({ name: p.name, sku: p.sku, price: p.price, sold: p.sold, revenue: p.price * p.sold })),
    defaultSort: 'price',
  },

  refund_rate: {
    subtitle: 'Estimated refund exposure — proxy based on sell-through performance by vendor',
    summaryStats: kpi => [
      { label: 'Refund Rate', value: `${kpi.current.toFixed(1)}%` },
      { label: 'Vendors', value: String(new Set(products.map(p => p.vendor)).size) },
      { label: 'High-risk SKUs', value: String(products.filter(p => p.sellThrough < 0.3).length) },
    ],
    cols: [
      { key: 'rank',   label: '#',               format: r => String(r.rank) },
      { key: 'vendor', label: 'Vendor',           format: r => String(r.vendor), isKey: true },
      { key: 'skus',   label: 'SKUs',             align: 'right', format: r => String(r.skus), defaultDesc: true },
      { key: 'avgST',  label: 'Avg Sell-Through', align: 'right', format: r => pct(r.avgST as number), defaultDesc: true },
      { key: 'risk',   label: 'Risk Score',       align: 'right', format: r => pct(r.risk as number), defaultDesc: true },
    ],
    rows: () => {
      const map: Record<string, { sold: number; total: number; count: number }> = {}
      for (const p of products) {
        if (!map[p.vendor]) map[p.vendor] = { sold: 0, total: 0, count: 0 }
        map[p.vendor].sold += p.sold
        map[p.vendor].total += p.sold + p.inventory
        map[p.vendor].count++
      }
      return Object.entries(map).map(([vendor, d]) => {
        const avgST = (d.sold / d.total) * 100
        return { vendor, skus: d.count, avgST, risk: Math.max(0, (1 - avgST / 100) * 15) }
      })
    },
    defaultSort: 'risk',
  },

  inventory_value: {
    subtitle: 'Inventory Value = On-Hand Units × Cost per Unit',
    summaryStats: kpi => {
      const totalUnits = products.reduce((s, p) => s + p.inventory, 0)
      return [
        { label: 'Total Value', value: gbp(kpi.current) },
        { label: 'Total Units On-Hand', value: String(totalUnits) },
        { label: 'SKUs', value: String(products.length) },
      ]
    },
    cols: [
      { key: 'rank',   label: '#',              format: r => String(r.rank) },
      { key: 'name',   label: 'Product',         format: r => String(r.name), isKey: true },
      { key: 'sku',    label: 'SKU',             format: r => String(r.sku) },
      { key: 'onHand', label: 'On-Hand',         align: 'right', format: r => String(r.onHand), defaultDesc: true },
      { key: 'cost',   label: 'Unit Cost',       align: 'right', format: r => gbp(r.cost as number), defaultDesc: true },
      { key: 'value',  label: 'Inventory Value', align: 'right', format: r => gbp(r.value as number), defaultDesc: true },
      { key: 'share',  label: '% of Total',     align: 'right', format: r => pct(r.share as number), defaultDesc: true },
    ],
    rows: () => {
      const total = products.reduce((s, p) => s + p.inventory * p.cost, 0)
      return products.map(p => ({
        name: p.name, sku: p.sku, onHand: p.inventory, cost: p.cost,
        value: p.inventory * p.cost, share: (p.inventory * p.cost / total) * 100,
      }))
    },
    defaultSort: 'value',
  },
}

// ── Sell-Through visual table ────────────────────────────────────────────────

function STBar({ value, target = 80 }: { value: number; target?: number }) {
  const color = value >= 60 ? '#22c55e' : value >= 30 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, position: 'relative' }}>
        <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: 2 }} />
        <div style={{
          position: 'absolute', top: -2, left: `${target}%`,
          width: 1.5, height: 8, background: '#6366f1', transform: 'translateX(-50%)',
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 34, textAlign: 'right' }}>
        {value.toFixed(1)}%
      </span>
    </div>
  )
}

function STDetailPanel({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <tr>
      <td colSpan={6} style={{ padding: 0 }}>
        <div style={{
          background: 'var(--bg)', borderBottom: '1px solid var(--border)',
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)' }}>{product.name}</span>
            <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>×</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              ['Units Sold', product.sold],
              ['On Hand', product.inventory],
              ['Days in Stock', `${product.daysInStock}d`],
              ['Sell-Through', `${(product.sellThrough * 100).toFixed(1)}%`],
              ['Price', `£${product.price.toFixed(2)}`],
              ['Cost', `£${product.cost.toFixed(2)}`],
              ['Gross Margin', `${(product.grossMargin * 100).toFixed(1)}%`],
              ['Revenue', `£${(product.price * product.sold).toFixed(0)}`],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  )
}

function STTable({ stTarget }: { stTarget: number }) {
  const [selectedSku, setSelectedSku] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<string>('st')
  const [sortDesc, setSortDesc] = useState(true)

  const stCols: { key: string; label: string; align?: 'right' }[] = [
    { key: 'name',      label: 'Product' },
    { key: 'price',     label: 'Price',         align: 'right' },
    { key: 'sold',      label: 'Units Sold',    align: 'right' },
    { key: 'inventory', label: 'On-Hand',       align: 'right' },
    { key: 'st',        label: 'Sell-Through',  align: 'right' },
    { key: 'days',      label: 'Days in Stock', align: 'right' },
  ]

  const rows = [...products]
    .map(p => ({ ...p, st: p.sellThrough * 100, days: p.daysInStock }))
    .sort((a, b) => {
      const av = a[sortKey as keyof typeof a] as number
      const bv = b[sortKey as keyof typeof b] as number
      return sortDesc ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1)
    })

  function handleSort(key: string) {
    if (key === sortKey) setSortDesc(d => !d)
    else { setSortKey(key); setSortDesc(true) }
  }

  return (
    <div>
      <div style={{ padding: '14px 24px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Products by Sell-Through Rate</span>
        <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>
          Target marker at {stTarget}% · click row to expand
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ width: 28, padding: '8px 8px 8px 24px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--text-subtle)' }}>#</th>
            {stCols.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{
                  padding: '8px 12px',
                  textAlign: col.align === 'right' ? 'right' : 'left',
                  fontSize: 10, fontWeight: 600,
                  color: sortKey === col.key ? 'var(--accent)' : 'var(--text-subtle)',
                  cursor: 'pointer', userSelect: 'none',
                  whiteSpace: 'nowrap',
                  background: 'var(--surface)',
                  position: 'sticky', top: 0,
                }}
              >
                {col.label} {sortKey === col.key ? (sortDesc ? '↓' : '↑') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => (
            <>
              <tr
                key={p.sku}
                onClick={() => setSelectedSku(prev => prev === p.sku ? null : p.sku)}
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '10px 8px 10px 24px', fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600 }}>
                  #{i + 1}
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500, maxWidth: 180 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 1 }}>{p.vendor} · {p.sku}</div>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>£{p.price.toFixed(2)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>{p.sold}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>{p.inventory}</td>
                <td style={{ padding: '10px 24px 10px 12px', minWidth: 160 }}>
                  <STBar value={p.st} target={stTarget} />
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>{p.daysInStock}d</td>
              </tr>
              {selectedSku === p.sku && <STDetailPanel product={p} onClose={() => setSelectedSku(null)} />}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Generic sortable table ────────────────────────────────────────────────────

function DataTable({ cfg, defaultSort }: { cfg: DimConfig; defaultSort: string }) {
  const [sortKey, setSortKey] = useState(defaultSort)
  const [sortDesc, setSortDesc] = useState(true)

  function handleSort(col: ColDef) {
    if (col.key === sortKey) {
      setSortDesc(d => !d)
    } else {
      setSortKey(col.key)
      setSortDesc(col.defaultDesc !== false)
    }
  }

  const rawRows = cfg.rows()
  const sorted = [...rawRows].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (typeof av === 'number' && typeof bv === 'number') return sortDesc ? bv - av : av - bv
    return sortDesc
      ? String(bv).localeCompare(String(av))
      : String(av).localeCompare(String(bv))
  })
  const ranked = sorted.map((r, i) => ({ ...r, rank: i + 1 }))

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          {cfg.cols.map(col => (
            <th
              key={col.key}
              onClick={() => col.key !== 'rank' && handleSort(col)}
              style={{
                padding: '9px 12px',
                textAlign: col.align === 'right' ? 'right' : 'left',
                fontSize: 10, fontWeight: 600,
                color: col.key === sortKey ? 'var(--accent)' : 'var(--text-subtle)',
                cursor: col.key === 'rank' ? 'default' : 'pointer',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                position: 'sticky', top: 0,
                background: 'var(--bg)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {col.label}{col.key === sortKey ? (sortDesc ? ' ↓' : ' ↑') : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ranked.map((row, i) => (
          <tr
            key={i}
            style={{ borderBottom: '1px solid var(--border)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {cfg.cols.map(col => (
              <td
                key={col.key}
                style={{
                  padding: '9px 12px',
                  textAlign: col.align === 'right' ? 'right' : 'left',
                  color: col.isKey ? 'var(--text)' : 'var(--text-muted)',
                  fontWeight: col.isKey ? 500 : 400,
                  whiteSpace: col.isKey ? 'normal' : 'nowrap',
                  maxWidth: col.isKey ? 200 : undefined,
                }}
              >
                {col.format(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ExploreDrawer({ kpi, onClose }: Props) {
  const cfg = DIMENSIONS[kpi.id]
  if (!cfg) return null

  const stats = cfg.summaryStats(kpi)
  const stTarget = (kpi.target ?? 80)

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, backdropFilter: 'blur(2px)' }}
      />

      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: kpi.id === 'sell_through' ? 860 : 780,
        maxWidth: 'calc(100vw - 48px)',
        maxHeight: 'calc(100vh - 80px)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        zIndex: 101,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Explore · {kpi.label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
              How is this number calculated?
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 3 }}>{cfg.subtitle}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)',
              background: 'transparent', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              color: 'var(--text-muted)', fontSize: 16,
            }}
          >×</button>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 24px', borderBottom: '1px solid var(--border)' }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              flex: 1, background: 'var(--bg)',
              borderRadius: 8, border: '1px solid var(--border)', padding: '10px 14px',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {kpi.id === 'sell_through'
            ? <STTable stTarget={stTarget} />
            : <DataTable cfg={cfg} defaultSort={cfg.defaultSort} />
          }
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 24px',
          borderTop: '1px solid var(--border)',
          fontSize: 10, color: 'var(--text-subtle)',
        }}>
          {products.length} SKUs · Cost data simulated at 60% of retail price
        </div>
      </div>
    </>
  )
}
