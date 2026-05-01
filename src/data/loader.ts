import Papa from 'papaparse'
import type { SKU } from './types'

export async function loadSKUs(): Promise<SKU[]> {
  const res = await fetch('/merchandising_data.csv')
  const text = await res.text()
  const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
  return result.data.map(row => ({
    sku_id: row.sku_id,
    product_name: row.product_name,
    category: row.category as SKU['category'],
    season_week: Number(row.season_week),
    total_season_weeks: Number(row.total_season_weeks),
    weeks_remaining: Number(row.weeks_remaining),
    opening_inventory: Number(row.opening_inventory),
    units_sold: Number(row.units_sold),
    units_on_hand: Number(row.units_on_hand),
    weekly_velocity: Number(row.weekly_velocity),
    sell_through_pct: Number(row.sell_through_pct),
    st_target_pct: Number(row.st_target_pct),
    st_gap: Number(row.st_gap),
    original_price: Number(row.original_price),
    current_price: Number(row.current_price),
    cost_price: Number(row.cost_price),
    gross_margin_pct: Number(row.gross_margin_pct),
    days_since_last_markdown: Number(row.days_since_last_markdown),
    prior_markdown_taken: row.prior_markdown_taken === 'True',
    store_st_high: Number(row.store_st_high),
    store_st_low: Number(row.store_st_low),
    store_st_variance: Number(row.store_st_variance),
    weeks_of_supply: Number(row.weeks_of_supply),
    urgency_gap: Number(row.urgency_gap),
    urgency_label: row.urgency_label as SKU['urgency_label'],
    ai_diagnosis: row.ai_diagnosis as SKU['ai_diagnosis'],
    recommended_action: row.recommended_action,
    projected_st_lift_pct: Number(row.projected_st_lift_pct),
    projected_margin_impact_pts: Number(row.projected_margin_impact_pts),
    notes: row.notes,
  }))
}
