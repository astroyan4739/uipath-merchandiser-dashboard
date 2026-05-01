import { useState, useMemo, useRef, useEffect } from 'react'
import { defaultKpis, allAvailableKpis, products, dailyData, lastRefreshed } from './data/shopifyData'
import type { KPI, DailyPoint } from './data/shopifyData'
import { KPICard } from './components/KPICard'
import { TrendChart } from './components/TrendChart'

import { ActionTab } from './components/ActionTab'
import { CustomizePanel } from './components/CustomizePanel'
import { ScheduleModal } from './components/ScheduleModal'
import { DateRangePicker } from './components/DateRangePicker'
import type { DateRange } from './components/DateRangePicker'
import { ExplorePage } from './components/ExplorePage'
import { SalesRanking } from './components/SalesRanking'

type Tab = 'dashboard' | 'action'

const DEFAULT_RANGE: DateRange = {
  start: new Date(2026, 3, 24),
  end: new Date(2026, 3, 30),
  label: 'Last 7 days',
}

function filterData(range: DateRange): DailyPoint[] {
  const apr1 = new Date(2026, 3, 1).getTime()
  const apr30 = new Date(2026, 3, 30).getTime()
  const s = range.start.getTime()
  const e = range.end.getTime()

  if (s >= apr1 && e <= apr30) {
    const sd = range.start.getDate() - 1
    const ed = range.end.getDate() - 1
    return dailyData.slice(sd, ed + 1)
  }
  return dailyData
}

function scaleKpi(kpi: KPI, range: DateRange): KPI {
  const days = Math.round((range.end.getTime() - range.start.getTime()) / 86400000) + 1
  const factor = Math.min(days, 30) / 30
  if (kpi.unit === '%') return kpi
  return {
    ...kpi,
    current: Math.round(kpi.current * factor),
    previous: Math.round(kpi.previous * factor),
  }
}

function fmtDatetime(d: Date): string {
  return d.toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

const FREQ_OPTIONS = [
  { key: 'now',   label: 'Refresh now',  icon: true },
  { key: '30m',   label: 'Every 30 min', icon: false },
  { key: '1h',    label: 'Every 1 hr',   icon: false },
  { key: 'daily', label: 'Daily',         icon: false },
] as const

type FreqKey = typeof FREQ_OPTIONS[number]['key']

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_RANGE)
  const [activeKpiIds, setActiveKpiIds] = useState<string[]>(defaultKpis.map(k => k.id))
  const [targets, setTargets] = useState<Record<string, number>>({
    gross_sales: 11500,
    orders: 100,
    sell_through: 80,
    gross_margin: 40,
  })
  const [showCustomize, setShowCustomize] = useState(false)
  const [customizeInfoKpi, setCustomizeInfoKpi] = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string>('sales')
  const [exploringKpi, setExploringKpi] = useState<KPI | null>(null)
  const [exploreShowChart, setExploreShowChart] = useState(false)
  const [exploreTitle, setExploreTitle] = useState<string | undefined>(undefined)
  const [simulatedRefresh, setSimulatedRefresh] = useState<Date>(lastRefreshed)
  const [refreshFreq, setRefreshFreq] = useState<FreqKey>('1h')
  const [showRefreshMenu, setShowRefreshMenu] = useState(false)
  const refreshMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showRefreshMenu) return
    function handleClick(e: MouseEvent) {
      if (refreshMenuRef.current && !refreshMenuRef.current.contains(e.target as Node)) setShowRefreshMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showRefreshMenu])

  const filteredData = useMemo(() => filterData(dateRange), [dateRange])

  const visibleKpis = useMemo(
    () => activeKpiIds.map(id => allAvailableKpis.find(k => k.id === id)).filter(Boolean) as KPI[],
    [activeKpiIds]
  )

  const kpisWithTargets = useMemo(() =>
    visibleKpis.map(k => ({ ...k, target: targets[k.id] ?? k.target })),
    [visibleKpis, targets]
  )

  if (exploringKpi) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <header style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, height: 56 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 32 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#fff',
                }}>D</div>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Dashboard</span>
              </div>
            </div>
          </div>
        </header>
        <ExplorePage kpi={exploringKpi} onClose={() => setExploringKpi(null)} showChart={exploreShowChart} title={exploreTitle} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, height: 56 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 32 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff',
              }}>D</div>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Dashboard</span>
            </div>

            {/* Tabs */}
            <nav style={{ display: 'flex', background: 'var(--bg)', borderRadius: 6, padding: 2, gap: 2 }}>
              {([['dashboard', 'Dashboard'], ['action', 'AI Actions']] as [Tab, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 4,
                    border: 'none',
                    background: activeTab === id ? 'var(--surface)' : 'transparent',
                    boxShadow: activeTab === id ? 'var(--shadow-sm)' : 'none',
                    color: activeTab === id ? 'var(--text)' : 'var(--text-muted)',
                    fontSize: 11, fontWeight: activeTab === id ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                  {id === 'action' && (
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      background: activeTab === id ? 'var(--accent-bg)' : 'var(--border)',
                      color: activeTab === id ? 'var(--accent)' : 'var(--text-muted)',
                      padding: '1px 5px',
                      borderRadius: 4,
                    }}>1</span>
                  )}
                </button>
              ))}
            </nav>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Refresh indicator + frequency picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-subtle)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  Last refreshed: {fmtDatetime(simulatedRefresh)}
                </div>

                <div ref={refreshMenuRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowRefreshMenu(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 8px', borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: showRefreshMenu ? 'var(--accent-bg)' : 'var(--surface)',
                      color: showRefreshMenu ? 'var(--accent)' : 'var(--text-muted)',
                      fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                      <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M8 1v3.5L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {FREQ_OPTIONS.find(o => o.key === refreshFreq)?.label}
                    <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                      <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {showRefreshMenu && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      zIndex: 55, minWidth: 148, overflow: 'hidden',
                    }}>
                      {FREQ_OPTIONS.map((opt, i) => (
                        <>
                          {i === 1 && (
                            <div key="sep" style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
                          )}
                          <button
                            key={opt.key}
                            onClick={() => {
                              if (opt.key === 'now') {
                                setSimulatedRefresh(new Date())
                              } else {
                                setRefreshFreq(opt.key)
                              }
                              setShowRefreshMenu(false)
                            }}
                            style={{
                              width: '100%', textAlign: 'left',
                              padding: '8px 14px', border: 'none',
                              background: (opt.key !== 'now' && opt.key === refreshFreq) ? 'var(--accent-bg)' : 'none',
                              color: (opt.key !== 'now' && opt.key === refreshFreq) ? 'var(--accent)' : 'var(--text)',
                              fontSize: 12, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 8,
                            }}
                            onMouseEnter={e => { if (opt.key !== refreshFreq) e.currentTarget.style.background = 'var(--bg)' }}
                            onMouseLeave={e => { if (opt.key !== refreshFreq) e.currentTarget.style.background = 'none' }}
                          >
                            {opt.icon && (
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <path d="M8 1v3.5L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                            {opt.label}
                          </button>
                        </>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

              {/* Customize */}
              <button
                onClick={() => setShowCustomize(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 8px',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  background: 'var(--surface)',
                  fontSize: 11, fontWeight: 500,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                Customize
              </button>

              {/* Schedule Report */}
              <button
                onClick={() => setShowSchedule(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 8px',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  background: 'var(--surface)',
                  fontSize: 11, fontWeight: 500,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Schedule Report
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 40px 60px' }}>

        {activeTab === 'dashboard' && (
          <>

            {/* KPI Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(visibleKpis.length, 4)}, 1fr)`,
              gap: 16,
              marginBottom: 24,
            }}>
              {kpisWithTargets.map(kpi => (
                <KPICard
                  key={kpi.id}
                  kpi={kpi}
                  onTargetChange={(val) => setTargets(t => ({ ...t, [kpi.id]: val }))}
                  onExplore={() => { setExploringKpi(kpi); setExploreShowChart(false); setExploreTitle(undefined) }}
                />
              ))}
            </div>

            {/* Trend Chart */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '20px 24px',
              marginBottom: 16,
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Performance Trend</div>
                  <DateRangePicker value={dateRange} onChange={setDateRange} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[['sales', 'Sales'], ['orders', 'Orders'], ['sellThrough', 'Sell-Through'], ['grossMargin', 'Margin']].map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => setSelectedMetric(id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 5,
                        border: 'none',
                        fontSize: 11, fontWeight: 500,
                        cursor: 'pointer',
                        background: selectedMetric === id ? 'var(--accent)' : 'var(--bg)',
                        color: selectedMetric === id ? '#fff' : 'var(--text-muted)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <TrendChart
                current={filteredData}
                metric={selectedMetric as 'sales' | 'orders' | 'sellThrough' | 'grossMargin'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <SalesRanking
                products={products}
                metric="revenue"
                onExplore={(title) => { setExploringKpi(allAvailableKpis.find(k => k.id === 'gross_sales')!); setExploreShowChart(true); setExploreTitle(title) }}
              />
              <SalesRanking
                products={products}
                metric="sellThrough"
                onExplore={(title) => { setExploringKpi(allAvailableKpis.find(k => k.id === 'sell_through')!); setExploreShowChart(true); setExploreTitle(title) }}
              />
              <SalesRanking
                products={products}
                metric="grossMargin"
                onExplore={(title) => { setExploringKpi(allAvailableKpis.find(k => k.id === 'gross_margin')!); setExploreShowChart(true); setExploreTitle(title) }}
              />
            </div>
          </>
        )}

        {activeTab === 'action' && (
          <ActionTab products={products} />
        )}
      </main>

      {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} />}

      {/* Customize modal */}
      {showCustomize && (
        <div
          onClick={() => setShowCustomize(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              borderRadius: 14,
              width: 560,
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px 16px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Customize Dashboard</div>
                <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>Select which KPI metrics to display</div>
              </div>
              <button
                onClick={() => setShowCustomize(false)}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  border: '1px solid var(--border)', background: 'none',
                  color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
            </div>

            {/* KPI list */}
            <div style={{ padding: '16px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {allAvailableKpis.map(kpi => {
                  const active = activeKpiIds.includes(kpi.id)
                  return (
                    <div
                      key={kpi.id}
                      onClick={() => {
                        if (active) {
                          if (activeKpiIds.length <= 1) return
                          setActiveKpiIds(ids => ids.filter(x => x !== kpi.id))
                        } else {
                          setActiveKpiIds(ids => [...ids, kpi.id])
                        }
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', height: 48, boxSizing: 'border-box',
                        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 8,
                        background: active ? 'var(--accent-bg)' : 'var(--bg)',
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                        border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                        background: active ? 'var(--accent)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {active && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
                      </div>
                      {/* Label + info icon */}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: active ? 'var(--accent)' : 'var(--text)' }}>
                          {kpi.label}
                        </div>
                        <div
                          style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                          onClick={e => e.stopPropagation()}
                          onMouseEnter={() => setCustomizeInfoKpi(kpi.id)}
                          onMouseLeave={() => setCustomizeInfoKpi(null)}
                        >
                          <div style={{
                            width: 14, height: 14, borderRadius: '50%',
                            border: '1px solid var(--border)',
                            background: customizeInfoKpi === kpi.id ? 'var(--accent-bg)' : 'transparent',
                            color: customizeInfoKpi === kpi.id ? 'var(--accent)' : 'var(--text-subtle)',
                            fontSize: 9, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'default', flexShrink: 0,
                          }}>i</div>
                          {customizeInfoKpi === kpi.id && (
                            <div style={{
                              position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
                              transform: 'translateX(-50%)', width: 240,
                              background: '#1e1e2e', color: '#e2e8f0',
                              borderRadius: 8, padding: '12px 14px',
                              fontSize: 11, lineHeight: 1.6,
                              boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 70, pointerEvents: 'none',
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
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                {activeKpiIds.length} of {allAvailableKpis.length} metrics selected · minimum 1 required
              </span>
              <button
                onClick={() => setShowCustomize(false)}
                style={{
                  padding: '6px 16px', borderRadius: 6, border: 'none',
                  background: 'var(--accent)', color: '#fff',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >Done</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
