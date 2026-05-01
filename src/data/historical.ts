export interface CategorySnapshot {
  st: number
  margin: number
}

export interface PeriodSnapshot {
  period_id: string
  label: string
  season_context: string
  display_date: string
  date_range?: string
  portfolio: { st: number; margin: number }
  by_category: Record<string, CategorySnapshot>
}

export interface HistoricalData {
  current: PeriodSnapshot
  snapshots: PeriodSnapshot[]
}

export async function loadHistorical(): Promise<HistoricalData> {
  const res = await fetch('/historical_data.json')
  return res.json()
}
