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

**`KPICard`** — displays one KPI with delta badge, threshold progress bar (height 4px, color-coded green ≥100% / amber ≥80% / red <80%), set/edit target inline input, info tooltip (opens downward), and a `···` more menu (Set target / Explore data). Period label `dataPeriodLabel` shown below metric name.

**`ExplorePage`** — full-screen overlay driven by two props: `showChart` (boolean) and `title` (optional string). When `showChart=false` (KPI card explore), renders a hero card + sortable data table. When `showChart=true` (ranking card explore), renders a bar chart with top/bottom toggle + full product table.

**`SalesRanking`** — renders one of three ranking bar charts (revenue / sellThrough / grossMargin). Bar colors: revenue `#60a5fa`, sellThrough `#7c3aed`, grossMargin `#1e3a5f`. All grossMargin values are uniform (40%) by data design — a note is shown to explain this. `onExplore(title: string)` callback passes the card title up to App so ExplorePage knows which chart to render.

**`ActionTab`** — AI Actions tab. Contains a single `BundleCard` recommendation with a 4-step reasoning chain. Each step (`SignalDetail`, `PatternDetail`, `StrategyDetail`, `ImpactDetail`) renders real data visualisations when expanded. Confidence is hardcoded as "High confidence" green pill. Adopt/Dismiss buttons are at card bottom, right-aligned. `THOUGHT_STEPS` is defined inside `BundleCard` (not at module level) so it has access to product data for JSX detail nodes.

**`TrendChart`** — Recharts `LineChart` with `domain={['auto', 'auto']}` on YAxis to auto-scale to data range (never starts at 0). Metric selector (Sales / Orders / Sell-Through / Margin) drives which `DailyPoint` field is plotted.

### App header
Brand name is "Dashboard" (D icon). Right side: last-refreshed datetime + frequency picker (manual / 30m / 1h / daily) — UI demo only, no backend. Customize button opens modal for adding/removing KPI metrics (2-column grid, info icon tooltip per KPI). Schedule Report button opens `ScheduleModal`.

### Layout constants
- Main content: `padding: 24px 40px 60px`, `maxWidth: 1400px`, `margin: 0 auto`
- KPI grid: `gap: 16px`, `repeat(n, 1fr)` up to 4 columns
- Ranking grid: `repeat(3, 1fr)`, `gap: 16px`

### Explore flow (App.tsx state)
```
exploringKpi     — which KPI object to show in ExplorePage
exploreShowChart — false = KPI hero card mode, true = bar chart mode
exploreTitle     — overrides breadcrumb when coming from a SalesRanking card
```
KPI card → `setExploreShowChart(false)`, `setExploreTitle(undefined)`
Ranking card → `setExploreShowChart(true)`, `setExploreTitle(cardTitle)`
