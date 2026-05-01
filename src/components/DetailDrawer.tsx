import type { SKU } from '../data/types'
import { DiagnosisBadge, UrgencyBadge, DIAGNOSIS_COLORS } from './DiagnosisBadge'

interface DetailDrawerProps {
  sku: SKU | null
  onClose: () => void
}

export function DetailDrawer({ sku, onClose }: DetailDrawerProps) {
  if (!sku) return null
  const c = DIAGNOSIS_COLORS[sku.ai_diagnosis]
  const discountPct = sku.original_price > 0
    ? Math.round(((sku.original_price - sku.current_price) / sku.original_price) * 100)
    : 0

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.25)',
          zIndex: 40,
          backdropFilter: 'blur(1px)',
        }}
      />
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: 380,
        background: '#fff',
        borderLeft: '1px solid #e4e4e7',
        zIndex: 50,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.08)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 22px', borderBottom: '1px solid #f4f4f5' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#a1a1aa', marginBottom: 3 }}>{sku.sku_id} · {sku.category}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#18181b', lineHeight: 1.4 }}>{sku.product_name}</div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#f4f4f5',
                border: 'none',
                borderRadius: 6,
                color: '#71717a',
                cursor: 'pointer',
                padding: '5px 9px',
                fontSize: 13,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <DiagnosisBadge diagnosis={sku.ai_diagnosis} />
            <UrgencyBadge label={sku.urgency_label} />
          </div>
        </div>

        <div style={{ padding: '18px 22px', flex: 1 }}>
          {/* AI Recommendation */}
          <div style={{
            background: c.bg,
            border: `1px solid ${c.dot}30`,
            borderRadius: 9,
            padding: '14px 16px',
            marginBottom: 18,
          }}>
            <div style={{ fontSize: 10, color: '#a1a1aa', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
              AI Recommendation
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 6 }}>
              {sku.recommended_action}
            </div>
            <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.6 }}>{sku.notes}</div>
            {sku.projected_st_lift_pct > 0 && (
              <div style={{ marginTop: 12, display: 'flex', gap: 20, paddingTop: 10, borderTop: `1px solid ${c.dot}20` }}>
                <Impact label="Proj. ST Lift" value={`+${sku.projected_st_lift_pct}%`} positive />
                <Impact
                  label="Margin Impact"
                  value={`${sku.projected_margin_impact_pts > 0 ? '+' : ''}${sku.projected_margin_impact_pts}pp`}
                  positive={sku.projected_margin_impact_pts >= 0}
                />
              </div>
            )}
          </div>

          <Section title="Performance">
            <Row label="Sell-Through" value={`${sku.sell_through_pct.toFixed(1)}%`} sub={`target ${sku.st_target_pct}%`} color={sku.sell_through_pct >= sku.st_target_pct ? '#16a34a' : '#dc2626'} />
            <Row label="ST Gap" value={`${sku.st_gap >= 0 ? '+' : ''}${sku.st_gap.toFixed(1)}pp`} color={sku.st_gap >= 0 ? '#16a34a' : '#dc2626'} />
            <Row label="Gross Margin" value={`${sku.gross_margin_pct.toFixed(1)}%`} color={sku.gross_margin_pct >= 50 ? '#18181b' : '#b45309'} />
            <Row label="Weekly Velocity" value={`${sku.weekly_velocity} u/wk`} />
            <Row label="Weeks of Supply" value={`${sku.weeks_of_supply.toFixed(1)} wks`} color={sku.weeks_of_supply > 10 ? '#b45309' : '#18181b'} />
          </Section>

          <Section title="Inventory">
            <Row label="Opening Inventory" value={`${sku.opening_inventory} units`} />
            <Row label="Units Sold" value={`${sku.units_sold} units`} />
            <Row label="On Hand" value={`${sku.units_on_hand} units`} />
            <Row label="Season Week" value={`W${sku.season_week}/${sku.total_season_weeks}`} sub={`${sku.weeks_remaining} wks remaining`} />
          </Section>

          <Section title="Pricing">
            <Row label="Original Price" value={`£${sku.original_price}`} />
            <Row label="Current Price" value={`£${sku.current_price}`} color={discountPct > 0 ? '#b45309' : '#18181b'} sub={discountPct > 0 ? `${discountPct}% markdown` : undefined} />
            <Row label="Cost Price" value={`£${sku.cost_price}`} />
            <Row label="Prior Markdown" value={sku.prior_markdown_taken ? 'Yes' : 'No'} color={sku.prior_markdown_taken ? '#b45309' : '#a1a1aa'} />
            <Row label="Days Since MD" value={sku.days_since_last_markdown > 0 ? `${sku.days_since_last_markdown}d` : 'None'} color={sku.days_since_last_markdown > 30 ? '#dc2626' : '#18181b'} />
          </Section>

          <Section title="Store Distribution">
            <Row label="Best Store ST" value={`${sku.store_st_high}%`} color="#16a34a" />
            <Row label="Worst Store ST" value={`${sku.store_st_low}%`} color={sku.store_st_low < 20 ? '#dc2626' : '#71717a'} />
            <Row label="Store Variance" value={`${sku.store_st_variance}pp`} color={sku.store_st_variance > 40 ? '#6d28d9' : '#71717a'} sub={sku.store_st_variance > 40 ? 'High — redistribution signal' : undefined} />
          </Section>
        </div>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, color: '#a1a1aa', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ border: '1px solid #f4f4f5', borderRadius: 8, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderBottom: '1px solid #f9f9f9',
    }}>
      <div style={{ fontSize: 12, color: '#71717a' }}>{label}</div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: color ?? '#18181b' }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: '#a1a1aa', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}

function Impact({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#a1a1aa', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: positive ? '#16a34a' : '#b45309' }}>{value}</div>
    </div>
  )
}
