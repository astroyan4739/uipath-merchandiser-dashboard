export type UrgencyLabel = 'Critical' | 'OK' | 'Reorder'
export type AiDiagnosis = 'On Track' | 'Wrong Price' | 'Wrong Location' | 'Wrong Product' | 'Over-discounted'
export type Category = 'Outerwear' | 'Knitwear' | 'Denim' | 'Accessories' | 'Footwear'

export interface SKU {
  sku_id: string
  product_name: string
  category: Category
  season_week: number
  total_season_weeks: number
  weeks_remaining: number
  opening_inventory: number
  units_sold: number
  units_on_hand: number
  weekly_velocity: number
  sell_through_pct: number
  st_target_pct: number
  st_gap: number
  original_price: number
  current_price: number
  cost_price: number
  gross_margin_pct: number
  days_since_last_markdown: number
  prior_markdown_taken: boolean
  store_st_high: number
  store_st_low: number
  store_st_variance: number
  weeks_of_supply: number
  urgency_gap: number
  urgency_label: UrgencyLabel
  ai_diagnosis: AiDiagnosis
  recommended_action: string
  projected_st_lift_pct: number
  projected_margin_impact_pts: number
  notes: string
}
