# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite HMR)
npm run build      # tsc -b && vite build (outputs to dist/)
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

No test suite is configured.

## Architecture

**Single-page React 19 + TypeScript app** built with Vite. All data is static and hardcoded — there is no backend or API.

### Data layer (`src/data/shopifyData.ts`)
The single source of truth. Exports:
- `products: Product[]` — 20 SKUs with price, cost, inventory, sold, sellThrough, grossMargin, daysInStock
- `dailyData / prevDailyData: DailyPoint[]` — 30-day April 2026 and March 2026 daily series
- `defaultKpis / allAvailableKpis: KPI[]` — 4 default + 3 optional KPI definitions with definition/formula/businessUse metadata
- `lastRefreshed`, `dataPeriodLabel` — display constants

Cost and sellThrough are derived at build time (cost = price × 0.60, sellThrough = sold / (sold + inventory)). All "historical" data is generated with multiplier arrays — not real orders.

### App shell (`src/App.tsx`)
Controls all top-level state: active tab, date range, KPI visibility (`activeKpiIds`), per-KPI targets, explore overlay, refresh frequency, and the customize modal. Two tabs: `dashboard` and `action`.

Date range filtering (`filterData`) slices `dailyData` by day index when the range falls within April 2026; otherwise returns the full array. KPI values for non-percentage units are scaled linearly by day count (`scaleKpi`).

### Styling
**All styles are inline** (`style={{}}`). Tailwind is installed but barely used. Design tokens are CSS variables on `:root` in `src/index.css`:
- `--bg`, `--surface`, `--border`, `--text`, `--text-muted`, `--text-subtle`
- `--accent` (#6366f1 indigo), `--accent-bg`
- `--shadow-sm`, `--shadow`, `--shadow-lg`

Always use these variables for colours, never hardcode greys. Hardcoded hex is acceptable only for semantic colours (e.g. `#dc2626` red for low sell-through, `#22c55e` green for met targets, `#7c3aed` purple for sell-through bars, `#1e3a5f` dark navy for gross margin bars).

### Key components

**`KPICard`** — displays one KPI with delta badge, threshold progress bar, set/edit target inline input, info tooltip (opens downward), and a `···` more menu (Set target / Explore data).

**`ExplorePage`** — full-screen overlay driven by two props: `showChart` (boolean) and `title` (optional string). When `showChart=false` (KPI card explore), renders a hero card + sortable data table. When `showChart=true` (ranking card explore), renders a bar chart with top/bottom toggle + full product table.

**`SalesRanking`** — renders one of three ranking bar charts (revenue / sellThrough / grossMargin). `onExplore(title: string)` callback passes the card title up to App so ExplorePage knows which chart to render.

**`ActionTab`** — AI Actions tab. Contains a single `BundleCard` recommendation with a 4-step animated reasoning chain (`SignalDetail`, `PatternDetail`, `StrategyDetail`, `ImpactDetail`). Each step renders real data visualisations when expanded. Confidence level is hardcoded as "High confidence".

**`TrendChart`** — Recharts `ComposedChart` showing daily sales/orders as bars with a threshold line. Metric selector drives which KPI series is shown.

### Explore flow (App.tsx state)
```
exploringKpi     — which KPI object to show in ExplorePage
exploreShowChart — false = KPI hero card mode, true = bar chart mode  
exploreTitle     — overrides breadcrumb when coming from a SalesRanking card
```
KPI card → `setExploreShowChart(false)`, `setExploreTitle(undefined)`  
Ranking card → `setExploreShowChart(true)`, `setExploreTitle(cardTitle)`
