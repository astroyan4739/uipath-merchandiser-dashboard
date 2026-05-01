import { useState, useRef } from 'react'
import { products, lastRefreshed, dataPeriodLabel } from '../data/shopifyData'
import type { KPI, Product } from '../data/shopifyData'

interface Props {
  kpi: KPI
  onClose: () => void
  showChart?: boolean
  title?: string
}

interface ColDef {
  key: string
  label: string
  align?: 'right'
  format: (row: Record<string, unknown>) => string
  isKey?: boolean
  defaultDesc?: boolean
}

interface BarConfig {
  label: (row: Record<string, unknown>) => string
  value: (row: Record<string, unknown>) => number
  format: (v: number) => string
  color: (v: number) => string
}

interface DimConfig {
  subtitle: string
  summaryStats: (kpi: KPI) => { label: string; value: string }[]
  bar?: BarConfig
  cols: ColDef[]
  rows: () => Record<string, unknown>[]
  defaultSort: string
}

function pct(n: number) { return `${n.toFixed(1)}%` }
function gbp(n: number) { return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 0 })}` }

function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const DIMENSIONS: Record<string, DimConfig> = {
  gross_sales: {
    subtitle: 'Revenue = Units Sold × Unit Price, summed across all SKUs',
    summaryStats: kpi => [
      { label: 'Total Revenue', value: gbp(kpi.current) },
      { label: 'SKUs', value: String(products.length) },
      { label: 'Top SKU share', value: pct((Math.max(...products.map(p => p.price * p.sold)) / kpi.current) * 100) },
    ],
    bar: {
      label: r => String(r.name),
      value: r => r.revenue as number,
      format: v => gbp(v),
      color: () => '#60a5fa',
    },
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
      return products.map(p => ({ name: p.name, sku: p.sku, price: p.price, sold: p.sold, revenue: p.price * p.sold, share: (p.price * p.sold / total) * 100 }))
    },
    defaultSort: 'revenue',
  },
  orders: {
    subtitle: 'Order count = units sold per SKU',
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
    bar: {
      label: r => String(r.name),
      value: r => r.st as number,
      format: v => pct(v),
      color: () => '#7c3aed',
    },
    cols: [
      { key: 'rank',   label: '#',              format: r => String(r.rank) },
      { key: 'name',   label: 'Product title',  format: r => String(r.name), isKey: true },
      { key: 'sku',    label: 'Variant SKU',     format: r => String(r.sku) },
      { key: 'sold',   label: 'Inventory units sold', align: 'right', format: r => String(r.sold), defaultDesc: true },
      { key: 'onHand', label: 'Ending inventory', align: 'right', format: r => String(r.onHand), defaultDesc: true },
      { key: 'total',  label: 'Total units',    align: 'right', format: r => String(r.total), defaultDesc: true },
      { key: 'st',     label: 'Sell-through rate', align: 'right', format: r => pct(r.st as number), defaultDesc: true },
    ],
    rows: () => products.map(p => ({ name: p.name, sku: p.sku, sold: p.sold, onHand: p.inventory, total: p.sold + p.inventory, st: p.sellThrough * 100 })),
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
    bar: {
      label: r => String(r.name),
      value: r => r.margin as number,
      format: v => pct(v),
      color: () => '#1e3a5f',
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
    subtitle: 'AOV = Gross Sales ÷ Orders; shown as unit price × volume',
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
    subtitle: 'Estimated refund exposure by vendor — proxy based on sell-through',
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
      return products.map(p => ({ name: p.name, sku: p.sku, onHand: p.inventory, cost: p.cost, value: p.inventory * p.cost, share: (p.inventory * p.cost / total) * 100 }))
    },
    defaultSort: 'value',
  },
}

// ── Shared STBar for sell-through ─────────────────────────────────────────────

function STDetailPanel({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <tr>
      <td colSpan={7} style={{ padding: 0 }}>
        <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '14px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{product.name}</span>
            <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>×</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
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
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ExplorePage({ kpi, onClose, showChart, title }: Props) {
  const cfg = DIMENSIONS[kpi.id]
  const [sortKey, setSortKey] = useState(cfg?.defaultSort ?? '')
  const [sortDesc, setSortDesc] = useState(true)
  const [selectedSku, setSelectedSku] = useState<string | null>(null)
  const [barView, setBarView] = useState<'top' | 'bottom'>('top')
  const [showInfo, setShowInfo] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)

  if (!cfg) return null

  const rawRows = cfg.rows()
  const sorted = [...rawRows].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey]
    if (typeof av === 'number' && typeof bv === 'number') return sortDesc ? bv - av : av - bv
    return sortDesc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv))
  })
  const ranked = sorted.map((r, i) => ({ ...r, rank: i + 1 }))

  const stats = cfg.summaryStats(kpi)

  const barRows = cfg.bar
    ? [...rawRows].sort((a, b) => (cfg.bar!.value(b) - cfg.bar!.value(a)))
    : []
  const barDisplayed = cfg.bar
    ? (barView === 'top' ? barRows.slice(0, 5) : barRows.slice(-5).reverse())
    : []
  const barMax = barRows.length ? cfg.bar!.value(barRows[0]) : 0

  function handleSort(col: ColDef) {
    if (col.key === sortKey) setSortDesc(d => !d)
    else { setSortKey(col.key); setSortDesc(col.defaultDesc !== false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Sub-header */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 28px', height: 44,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 500, color: 'var(--text-muted)',
            padding: '4px 8px', borderRadius: 5,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard
        </button>
        <span style={{ color: 'var(--border)' }}>›</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title ?? kpi.label}</span>
        <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 4 }}>
          Last refreshed: {fmtTime(lastRefreshed)}
        </span>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 28px 60px' }}>

        {/* KPI hero card — for KPI card explores (no chart) */}
        {!showChart && (() => {
          const deltaPct = kpi.previous > 0 ? ((kpi.current - kpi.previous) / kpi.previous) * 100 : null
          const deltaUp = deltaPct !== null && deltaPct >= 0
          const fmtVal = (v: number) => kpi.unit === '£' ? `£${Math.round(v).toLocaleString('en-GB')}` : kpi.unit === '%' ? `${v.toFixed(1)}%` : Math.round(v).toLocaleString('en-GB')
          const target = kpi.target
          const targetPct = target !== undefined ? (kpi.current / target) * 100 : null
          const targetColor = targetPct === null ? '' : targetPct >= 100 ? '#22c55e' : targetPct >= 80 ? '#f59e0b' : '#ef4444'
          return (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)', marginBottom: 24,
              display: 'inline-block', minWidth: 260,
            }}>
              {/* Label row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>{kpi.label}</span>
                  <div ref={infoRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                        position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                        width: 260,
                        background: '#1e1e2e', color: '#e2e8f0',
                        borderRadius: 8, padding: '12px 14px',
                        fontSize: 11, lineHeight: 1.6,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 60, pointerEvents: 'none',
                      }}>
                        <div style={{ position: 'absolute', bottom: '100%', left: 8, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid #1e1e2e' }} />
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
              {/* Value */}
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {fmtVal(kpi.current)}
              </div>
              {/* Delta */}
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
              {/* Threshold indicator */}
              {target !== undefined && targetPct !== null && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ position: 'relative', height: 4, background: 'var(--bg)', borderRadius: 2, overflow: 'visible', marginBottom: 6 }}>
                    <div style={{
                      height: '100%', width: `${Math.min(targetPct, 100)}%`,
                      background: targetColor, borderRadius: 2, transition: 'width 0.4s ease',
                    }} />
                    <div style={{
                      position: 'absolute', top: -3, right: 0,
                      width: 2, height: 10, background: 'var(--text-subtle)', borderRadius: 1,
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: targetColor, fontWeight: 600 }}>
                      {targetPct >= 100 ? '✓ Target met' : `${targetPct.toFixed(1)}% of target`}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>
                      Target: {fmtVal(target)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* Bar chart — only when showChart=true and bar config exists */}
        {showChart && cfg.bar && (
          <div style={{
            background: 'var(--surface)', borderRadius: 12,
            border: '1px solid var(--border)', padding: '20px 24px',
            marginBottom: 20, boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{kpi.label}</div>
                <div ref={infoRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                      position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
                      transform: 'translateX(-50%)', width: 260,
                      background: '#1e1e2e', color: '#e2e8f0',
                      borderRadius: 8, padding: '12px 14px',
                      fontSize: 11, lineHeight: 1.6,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 60, pointerEvents: 'none',
                    }}>
                      <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1e1e2e' }} />
                      <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{kpi.label}</div>
                      <div style={{ marginBottom: 6 }}>{kpi.definition}</div>
                      <div style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 10, marginBottom: 4 }}>{kpi.formula}</div>
                      <div style={{ color: '#7dd3fc', fontSize: 10 }}>💡 {kpi.businessUse}</div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 6, padding: 2, gap: 2 }}>
                {(['top', 'bottom'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setBarView(v)}
                    style={{
                      padding: '4px 12px', border: 'none', borderRadius: 4,
                      fontSize: 11, fontWeight: 500, cursor: 'pointer',
                      background: barView === v ? 'var(--surface)' : 'transparent',
                      color: barView === v ? 'var(--text)' : 'var(--text-muted)',
                      boxShadow: barView === v ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    {v === 'top' ? '↑ Top 5' : '↓ Bottom 5'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ borderTop: '1px dashed var(--border)', marginBottom: 16 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {barDisplayed.map((row, i) => {
                const val = cfg.bar!.value(row)
                const pctWidth = barMax > 0 ? (val / barMax) * 100 : 0
                return (
                  <div key={i}>
                    <div style={{
                      fontSize: 12, color: 'var(--text)', marginBottom: 5,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {cfg.bar!.label(row)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pctWidth}%`,
                          background: cfg.bar!.color(val),
                          borderRadius: 3, transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', minWidth: 52, textAlign: 'right' }}>
                        {cfg.bar!.format(val)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Data table */}
        <div style={{
          background: 'var(--surface)', borderRadius: 12,
          border: '1px solid var(--border)', overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                {cfg.cols.map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.key !== 'rank' && handleSort(col)}
                    style={{
                      padding: '11px 16px',
                      textAlign: col.align === 'right' ? 'right' : 'left',
                      fontSize: 11, fontWeight: 600,
                      color: col.key === sortKey ? 'var(--accent)' : 'var(--text-subtle)',
                      cursor: col.key === 'rank' ? 'default' : 'pointer',
                      userSelect: 'none', whiteSpace: 'nowrap',
                    }}
                  >
                    {col.label}{col.key === sortKey ? (sortDesc ? ' ↓' : ' ↑') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((row, i) => {
                const isST = kpi.id === 'sell_through'
                const sku = String(row.sku ?? '')
                const expanded = isST && selectedSku === sku
                const product = isST ? products.find(p => p.sku === sku) ?? null : null
                return (
                  <>
                    <tr
                      key={i}
                      onClick={() => isST && setSelectedSku(prev => prev === sku ? null : sku)}
                      style={{ borderBottom: '1px solid var(--border)', cursor: isST ? 'pointer' : 'default' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {cfg.cols.map(col => (
                        <td
                          key={col.key}
                          style={{
                            padding: '11px 16px',
                            textAlign: col.align === 'right' ? 'right' : 'left',
                            color: col.isKey ? 'var(--text)' : 'var(--text-muted)',
                            fontWeight: col.isKey ? 500 : 400,
                            whiteSpace: col.isKey ? 'normal' : 'nowrap',
                          }}
                        >
                          {col.format(row)}
                        </td>
                      ))}
                    </tr>
                    {expanded && product && (
                      <STDetailPanel product={product} onClose={() => setSelectedSku(null)} />
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-subtle)' }}>
            {rawRows.length} items · Cost data simulated at 60% of retail price
          </div>
        </div>
      </div>
    </div>
  )
}
