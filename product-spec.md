# Product Spec
## Merchandiser Decision Dashboard — Sell-Through × Margin

**Version:** 0.2 — Design Reference
**Last updated:** 2026-04-30

---

## 0. Design Research Summary

### How a Senior Merchandiser Uses This Data

When a senior merchandiser sees a dashboard, they don't read numbers — they read **signals**. The first question is never "what is the number?" but "why is it this number, and what does that mean I should do?"

資深採購看儀表板時，讀的不是數字——讀的是**訊號**。第一個問題從來不是「數字是多少？」，而是「為什麼是這個數字，這代表我應該怎麼做？」

| Root Cause | Signal | Action |
|---|---|---|
| **Wrong price 定價錯誤** | Good traffic, low conversion | Markdown 降價 |
| **Wrong location 位置錯誤** | High ST in some stores, dead in others | Redistribute inventory 調撥庫存 |
| **Wrong timing 時機未到** | Early in season, velocity is on pace | Wait 等待觀察 |
| **Wrong product 商品本身問題** | Low traffic AND low conversion across all doors | Promote or bundle 促銷或組合搭售 |

> **Core tension:** Sell-through and margin are competing goals. High sell-through often requires markdowns that erode margin. The goal is not to maximize either — it's to optimize the combination before the season ends.

**The diagnostic questions a merchandiser asks, in order:**

1. Is it low everywhere, or just in some stores/channels? → if isolated, it's a distribution problem not a product problem
2. How far into the season are we? → 22% ST in week 2 is fine; 22% ST in week 8 is a fire
3. Has a markdown already been taken, and did it move the needle? → if not, price is not the lever
4. What is the gap between weeks-of-supply and weeks remaining? → this is the urgency signal

**The 4 actions, in order of preference:**

1. **Wait** — early season, on pace, no urgency
2. **Redistribute** — imbalanced across doors, zero margin cost
3. **Promote** — awareness problem, avoid permanent markdown
4. **Markdown** — always staged: 15–20% first, observe 7 days, then 30% if no lift. Never go straight to deep discount. Set a margin floor and never breach it without a manual override.

---

## 1. Problem Statement

Senior merchandisers manage 300+ SKUs simultaneously across a season with a hard deadline. Their core job is to balance two competing goals — sell-through rate and gross margin — and act early enough to influence outcomes before the season ends.

**Current state:** Data exists but is fragmented. Merchandisers manually pull sell-through, margin, inventory, and pricing data from separate sources, run the diagnosis in their heads, decide on an action, and then act — all before the morning ends. This process is slow, inconsistent, and scales poorly.

**The gap:** The system shows what is happening. It does not tell the merchandiser why, how urgent it is, or what to do about it.

**Desired state:** A single view that surfaces only what needs attention, already diagnosed, with a recommended action ready to review — so the merchandiser's cognitive energy goes toward judgment, not data hunting.

---

## 2. User Profile

**Primary user: Senior Merchandiser**

- Manages 2–4 product categories, 200–400 active SKUs per season
- Makes 10–20 meaningful decisions per week (markdowns, transfers, promotions)
- Works under hard seasonal deadlines — late decisions compound into worse outcomes
- High domain expertise, moderate-to-low trust in AI tools by default
- Skeptical of black-box recommendations — needs to understand the "why" to act on it
- Core fear: ending a season with excess inventory forced into deep clearance

**Mental model:** Merchandisers think in rates and time pressure, not raw numbers. They think: *"Where am I vs. where I should be, and how many weeks do I have left to fix it?"*

---

## 3. Jobs to Be Done

| Job | Frequency | Current Pain |
|---|---|---|
| **Morning triage** — find what needs attention today | Daily | Manually scanning full SKU list, no pre-filtering |
| **Diagnose** — understand why a SKU is off | Daily | Requires cross-referencing 3–4 separate data sources |
| **Decide** — choose the right action for the right reason | Daily | Action logic lives entirely in the merchandiser's head |
| **Execute** — approve, adjust, or override the action | Daily | Multiple systems, no single action point |
| **Review outcomes** — did last week's decisions work? | Weekly | No automatic feedback loop, decisions aren't tracked |

---

## 4. Design Opportunities (HMW)

### HMW 1 — 從「看數字」到「讀訊號」
> Merchandisers currently have to translate numbers into problems themselves. That translation has a high cognitive cost.

**Opportunity:** Can the system tell the merchandiser what the number *means* at the same moment the number appears?

---

### HMW 2 — 從「發現異常」到「知道為什麼」
> Low sell-through today is just a red number. The merchandiser has to open 4 tabs to diagnose the root cause.

**Opportunity:** Build diagnostic logic into the interface — don't just show "low," show *why it's low* (Wrong Price / Wrong Location / Wrong Timing / Wrong Product).

---

### HMW 3 — 從「有問題」到「該怎麼做」
> Data tells you something is wrong. It does not tell you what to do. The action decision still lives entirely in the merchandiser's head.

**Opportunity:** Every flagged item comes with a recommended next action, prioritized, with projected impact (margin effect + expected ST lift).

---

### HMW 4 — 從「單一數字」到「時間壓力可見化」
> The same low sell-through % with 4 weeks left vs. 10 weeks left is a completely different level of urgency — but a flat table treats them identically.

**Opportunity:** Encode the weeks-of-supply vs. weeks-remaining gap as a visual urgency dimension on every SKU, always present without calculation.

---

### HMW 5 — 從「AI黑盒」到「可信任的夥伴」
> If the merchandiser can't see why the AI made a recommendation, they won't trust it — and they'll stop using it.

**Opportunity:** Every AI recommendation surfaces its reasoning transparently. Merchandisers can see the logic, adjust parameters, and override with a reason — nothing is hidden.

---

### HMW 6 — 從「看全部」到「只看要決策的」
> Merchandisers manage 300+ SKUs, but on any given day only 10–15 need a decision.

**Opportunity:** The default view shows only items that need attention. Everything else is collapsed. Attention is focused where decisions need to happen.

---

### HMW 7 — 從「決策消失」到「學習迴圈」
> After a decision is made, outcomes aren't tracked back. Next time the same situation appears, the merchandiser starts from zero.

**Opportunity:** Track each decision's downstream performance. Let both the system and the merchandiser learn from results and calibrate over time.

---

## 5. Design Direction & Principles

> **One-line direction:** Build the merchandiser's mental model directly into the interface — humans own the judgment, the system owns the calculation.
>
> 把採購每天早上在腦中做的診斷與決策流程，直接內建到介面裡——讓人負責判斷，讓系統負責計算。

---

### Principle 1 — Diagnose, Don't Just Display
**診斷，不只是呈現**

Data's value is not in display — it's in explanation. Every anomaly surfaces with its most likely root cause. Merchandisers see a conclusion first, raw numbers second.

- Every metric anomaly has a root cause label attached
- Labels: Wrong Price / Wrong Location / Wrong Timing / Wrong Product
- Numbers are secondary — accessible on drill-down, not upfront

---

### Principle 2 — Urgency is a Dimension, Not a Filter
**緊急程度是維度，不是篩選條件**

Time pressure should be *visually present* on every item, not something the merchandiser has to calculate manually.

- Encode weeks-of-supply vs. weeks-remaining gap as color, icon, or progress bar
- More urgent items carry more visual weight
- The system tells the merchandiser "act now" vs. "still time to watch" — they don't calculate it

---

### Principle 3 — Recommendation Before Exploration
**先給方向，再讓深入探索**

The merchandiser's workflow is: confirm recommendation → dig in if uncertain → decide. It is NOT: look at raw data → analyze → think of action.

- Every flagged item has a default recommended action — no blank states waiting for the user to decide
- Detailed data lives behind drill-down (drawer, hover, expand), not in the primary view
- Primary view density: low. Decision density: high.

---

### Principle 4 — Transparent Intelligence Builds Trust
**透明的智慧才能建立信任**

An AI recommendation without a reason will be ignored. A reason creates the basis for a conversation.

- Every recommendation shows a plain-language reasoning summary
- Merchandisers can adjust assumption parameters (target ST%, margin floor) and see recommendations update in real time
- Overrides are not errors — they are data. The system records the reason and learns from it.

---

### Principle 5 — Action Has a Cost, Show It
**每個行動都有代價，讓它可見**

Merchandisers need to know not just *what to do* but *what it will cost them*.

- Every recommended action shows projected impact: expected ST lift / margin effect / execution cost
- Trade-offs between actions (markdown vs. redistribute vs. wait) are visible side-by-side on the same screen
- The interface does this calculation — the merchandiser should not have to

---

### Principle 6 — Focus Attention, Don't Flood It
**聚焦注意力，不是淹沒它**

A 300-row SKU table is not a dashboard — it's a to-do list that induces paralysis.

- Default view shows only items that need a decision; everything else is collapsed
- Batch actions allow similar-diagnosis SKUs to be handled together
- "Top 3 things that need action today" is a better starting point than "all data"

---

## 6. Information Architecture

```
Dashboard
├── 1. Portfolio Matrix View       ← Entry point, full picture
├── 2. Priority Action List        ← Default working view
│   └── SKU Row
│       ├── Diagnosis label
│       ├── Urgency indicator
│       ├── Recommended action chip
│       └── Quick action buttons
├── 3. SKU Detail Drawer           ← Drill-down, opens on click
│   ├── Diagnosis breakdown
│   ├── Supporting data
│   ├── AI recommendation + reasoning
│   └── Action panel (approve / adjust / override)
└── 4. Decision History            ← Outcome tracking, weekly review
```

---

## 7. Views Specification

---

### View 1 — Portfolio Matrix
**Purpose:** Give the merchandiser a spatial read of the full category before drilling in. One glance = full picture.

**Layout:** 2×2 scatter plot
- X axis: Gross Margin %
- Y axis: Sell-Through %
- Dot size: Inventory on hand (units)
- Dot color: Urgency level (based on WoS vs. weeks-remaining gap)

**Quadrant labels:**

| Quadrant | ST | Margin | Label | Default Action |
|---|---|---|---|---|
| Top right | High | High | Protect | Consider reorder |
| Top left | High | Low | Over-discounted | Hold, learn for next season |
| Bottom right | Low | High | Price or placement issue | Diagnose → redistribute or markdown |
| Bottom left | Low | Low | Danger zone | Act immediately |

**Interactions:**
- Hover dot → preview SKU name, ST%, margin%, urgency status
- Click dot → open SKU Detail Drawer
- Filter by category, season week, urgency level

---

### View 2 — Priority Action List
**Purpose:** The daily working view. Pre-filtered to SKUs that need a decision. This is where 80% of time is spent.

**Default filter:** Only shows SKUs flagged by AI as needing attention (anomaly vs. seasonal target + urgency threshold).

**Table columns:**

| Column | Description | Notes |
|---|---|---|
| Product / SKU | Name, image thumbnail, category | |
| Sell-Through % | Current vs. target at this season week | Show both — gap matters more than absolute |
| ST Gap | Actual minus target (e.g. −18%) | Color coded: red / yellow / green |
| Gross Margin % | Current blended margin | |
| Weeks of Supply | Units on hand ÷ weekly sell rate | |
| Weeks Remaining | Weeks left in season | |
| Urgency | WoS minus weeks-remaining gap | Visual bar or icon: Critical / Watch / OK |
| Last Price Change | Days since last markdown | Flags if >21 days with no action on at-risk items |
| AI Diagnosis | Root cause label | Wrong Price / Wrong Location / Wrong Timing / Wrong Product |
| Recommended Action | Top action chip | Markdown / Redistribute / Promote / Wait |
| Impact Estimate | Projected ST lift + margin effect | e.g. "+14% ST / −4pts margin" |
| Actions | Inline buttons | Approve / Adjust / Override |

**Row states:**
- Default: collapsed, shows key columns only
- Expanded: shows full data inline
- Actioned: grayed out, moved to "Done" section
- Snoozed: hidden until snooze date, reappears automatically

**Sorting:** Default = urgency score (highest first). Re-sortable by any column.

**Batch actions:** Select multiple SKUs with same diagnosis → apply same action to all at once.

---

### View 3 — SKU Detail Drawer
**Purpose:** Full diagnosis + action panel for a single SKU. Opens as a side drawer without leaving the list.

**Sections:**

**Header**
Name, image, category, season week progress indicator

**Sell-Through Status**
Current ST% vs. target curve — small line chart showing actual vs. expected trajectory across the season. Visual gap between "where I am" vs. "where I should be."

**Urgency Signal**
- Weeks of Supply: X weeks
- Weeks Remaining in Season: Y weeks
- Gap: +/− Z weeks — highlighted red if overexposed

**Inventory Distribution**
ST% by store/channel as a small bar chart. Flags imbalance if top 2 stores hold >50% of remaining stock.

**Margin History**
Original price → current price → margin at each step. Shows how much margin has already been given up.

**AI Diagnosis**
Root cause label + confidence indicator + plain-language explanation:
> *"68% of remaining inventory is concentrated in 2 low-traffic stores. 5 other stores are under-stocked and running above 60% sell-through. This pattern suggests a distribution imbalance, not a price or product issue."*

**Recommended Action Panel**
- Primary recommendation with projected impact
- Alternative actions shown below with their own impact estimates
- All parameters adjustable inline (change markdown %, change transfer quantity)
- Real-time impact recalculation as parameters change
- **Confirm / Adjust / Override** — override requires a reason code (feeds AI learning)

---

### View 4 — Decision History
**Purpose:** Weekly review. Did last week's decisions work? Close the feedback loop.

**Shows:**
- Decisions made in the past 7 / 14 / 30 days
- Outcome vs. projection (did ST lift as expected?)
- Decisions that outperformed / underperformed AI recommendation
- Cumulative margin impact of all decisions this season

---

## 8. AI Behavior Specification

**Diagnostic logic (runs continuously, surfaces in UI):**

```
For each SKU:

1. Calculate ST gap: actual ST% − target ST% at current season week
2. Calculate urgency gap: weeks-of-supply − weeks-remaining
3. Check price history: last markdown date, markdown depth
4. Check inventory distribution: ST% variance across doors

→ Assign root cause:
   If ST gap exists + distribution variance high       → Wrong Location
   If ST gap exists + price unchanged >21d + margin OK → Wrong Price
   If ST gap exists + prior markdown + no velocity lift → Wrong Product
   If ST gap within normal seasonal variance            → Wrong Timing (wait)

→ Generate action recommendation with impact model
→ Show confidence level + reasoning summary
```

**Override behavior:**
- Every override is logged with reason code
- Patterns in overrides feed back into diagnostic calibration
- System tracks: when did merchandiser override → what did they do instead → what was the outcome?

**Trust guardrails:**
- AI never executes — it only recommends
- Merchandiser always confirms before any action
- Reasoning is always visible, never hidden
- Hard margin floors are set by the merchandiser and respected by the AI

---

## 9. Key Interaction Flows

### Flow A — Morning Triage (target: under 15 min)
```
Open dashboard
→ Scan Portfolio Matrix for quadrant anomalies (30 sec)
→ Switch to Priority Action List (~10–15 items pre-filtered)
→ Scan urgency column top to bottom
→ Click highest-urgency item → review diagnosis in drawer
→ Approve / adjust / override recommendation
→ Repeat for remaining priority items
→ Done
```

### Flow B — Investigating a Specific SKU
```
Search or filter for SKU
→ Open SKU Detail Drawer
→ Read diagnosis + check inventory distribution chart
→ Review recommended action + impact estimate
→ Adjust parameters if needed
→ Confirm action
```

### Flow C — Batch Action (same diagnosis, multiple SKUs)
```
Filter list by diagnosis label (e.g. "Wrong Location")
→ Select all affected SKUs
→ Review batch impact summary
→ Approve in one action
```

---

## 10. Success Metrics

| Metric | Why It Matters |
|---|---|
| Time to complete morning triage | Core efficiency gain — target: under 15 min |
| AI recommendation acceptance rate | Proxy for trust and diagnosis accuracy |
| Override rate + override reason distribution | Tells us where AI is miscalibrated |
| End-of-season clearance rate | Ultimate business outcome |
| Margin erosion vs. prior season | Did decisions protect margin? |
| Weeks-of-supply gap at season end | Did we exit clean? |

---

## 11. Data Model

### Dataset: Synthetic — Built to Spec

**File:** `merchandising_data.csv`
**Script:** `generate_data.py` (regenerates the CSV, fully editable)
**50 SKUs × 5 categories × 30 columns**

Synthetic dataset purpose-built for the demo. All numbers are realistic and internally consistent. Pre-seeded with all 4 diagnostic root-cause scenarios so the dashboard has something meaningful to show immediately.

**Season setup:**
- Season week: 7 of 12
- Weeks remaining: 5
- ST target at week 7: 58% (7 ÷ 12)
- Cost price: simulated at 45% of original price

### Scenario breakdown

| Scenario | SKUs | Story it tells |
|---|---|---|
| **On Track** | 21 | Healthy items — some near sellout needing reorder signal |
| **Wrong Price** | 10 | Low ST, healthy margin, no markdown in 21+ days → price is the blocker |
| **Wrong Location** | 8 | Low overall ST but 60–68pt variance across doors → inventory imbalance |
| **Wrong Product** | 8 | Already marked down, still not moving → deeper problem |
| **Over-discounted** | 3 | High ST but margin already given away → learn for next season |

### CSV columns

| Column | Description |
|---|---|
| `sku_id` | SKU identifier (e.g. OW-001) |
| `product_name` | Display name |
| `category` | Outerwear / Knitwear / Denim / Accessories / Footwear |
| `season_week` | Current week in season (7) |
| `total_season_weeks` | Total season length (12) |
| `weeks_remaining` | Weeks left (5) |
| `opening_inventory` | Units at season start |
| `units_sold` | Units sold to date |
| `units_on_hand` | Remaining inventory |
| `weekly_velocity` | Avg units sold per week (last 4 weeks) |
| `sell_through_pct` | units_sold ÷ opening_inventory × 100 |
| `st_target_pct` | Expected ST% at this season week (58.0) |
| `st_gap` | Actual ST% − target ST% |
| `original_price` | Price at season start (USD) |
| `current_price` | Price today (post-markdown if any) |
| `cost_price` | Simulated cost (45% of original_price) |
| `gross_margin_pct` | (current_price − cost) ÷ current_price × 100 |
| `days_since_last_markdown` | Days since last price change (0 = never) |
| `prior_markdown_taken` | True if at least one markdown already applied |
| `store_st_high` | Best-performing store's ST% |
| `store_st_low` | Worst-performing store's ST% |
| `store_st_variance` | store_st_high − store_st_low (high = imbalance signal) |
| `weeks_of_supply` | units_on_hand ÷ weekly_velocity |
| `urgency_gap` | weeks_of_supply − weeks_remaining |
| `urgency_label` | Critical (≥10) / Watch (3–9) / OK (−1–2) / Reorder (<−1) |
| `ai_diagnosis` | Root cause: On Track / Wrong Price / Wrong Location / Wrong Product / Over-discounted |
| `recommended_action` | Suggested action with specifics (e.g. "Markdown 15%") |
| `projected_st_lift_pct` | Expected ST% increase from recommended action |
| `projected_margin_impact_pts` | Margin change in percentage points (negative = erosion) |
| `notes` | Plain-language diagnosis rationale |

### Key demo scenarios to showcase

**Scenario A — Wrong Location (best story for "AI catches what humans miss"):**
> OW-003 Quilted Vest Navy: 22% overall ST, but store_st_high = 68%, store_st_low = 8%, variance = 60pts. AI recommends redistribute — zero margin cost, +18% projected ST lift. Without the store breakdown, a human would have marked it down and lost margin unnecessarily.

**Scenario B — Wrong Price (most common, clearest action):**
> OW-002 Wool Overcoat Camel: 27.5% ST, 55% margin, 42 days since last markdown. No price action taken. AI flags it as a pricing problem, recommends 15% markdown, projects +14% ST lift at −8pts margin.

**Scenario C — Wrong Product (shows staged markdown logic):**
> OW-005 Puffer Vest Coral: 23.6% ST, already 30% off (original $99 → $69), prior_markdown_taken = True, still only 28% in best store. AI diagnosis: Wrong Product. Recommended action: Promote / Bundle — deeper discount won't move it, needs visibility.

**Scenario D — Danger Zone (urgency encoding):**
> KN-003 Cropped Cardigan Pink: urgency_gap = +24.4 (24 weeks of supply, 5 weeks left). Critical label. Already 29% off. Wrong Product diagnosis. Every week of inaction = 3.3 more units stranded.

### How to use in prototype

- Import `merchandising_data.csv` directly into Figma / Framer / any prototyping tool as a data source
- Filter by `urgency_label = Critical` to populate the Priority Action List default state
- Filter by `ai_diagnosis` to populate each quadrant of the Portfolio Matrix
- Use `projected_st_lift_pct` and `projected_margin_impact_pts` to populate the action panel impact estimates
- `notes` column = the plain-language AI reasoning text in the SKU drawer

---

## 12. Out of Scope (v1)

- Buying / reorder decisions (separate workflow)
- Pricing engine integration (this is decision support, not execution)
- Cross-category portfolio optimization
- Customer demand forecasting
- Mobile view

---

## 13. Sketch Starting Point

Start with **View 2 (Priority Action List)** — highest-frequency surface, most design decisions.

The critical design tensions to resolve first:
1. **Column hierarchy** — what's always visible vs. on expand?
2. **Urgency encoding** — color, icon, progress bar, or combined?
3. **Recommendation chip** — how much information fits inline before it needs a drawer?
4. **Override flow** — how do you make disagreeing with AI feel safe and easy, not like breaking something?

The Portfolio Matrix (View 1) and SKU Drawer (View 3) follow naturally once the list logic is solid.
