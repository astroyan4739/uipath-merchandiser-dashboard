"""
Generate historical snapshots for comparison tags.
Current state: AW25 Season Week 7, portfolio ST=45.9%, Margin=50.1%

Periods:
  7d   → AW25 Week 6   (1 week earlier, same season)
  30d  → AW25 Week 3   (4 weeks earlier, same season)
  60d  → AW25 Week 1   (season just opened)
  90d  → SS25 Week 11  (end of prior season, clearance mode)
  180d → SS25 Week 7   (mid prior season, comparable selling week)
  LY   → AW24 Week 7   (same season last year)

Simulation assumptions:
- Within AW25: ST% scales with week number (velocity-based), margin degrades
  as markdowns are taken. Week 1 = near-full-price. Week 7 = current state.
- SS25 (90d / 180d): different seasonal mix. Outerwear/heavy knitwear slow in
  SS; Accessories and Footwear carry more weight. Margin lower at W11 (clearance).
- AW24 LY: similar category mix to current but ST slightly lower (tougher year),
  margin slightly higher (less aggressive discounting).
"""

import json, csv, math

# ── Current baseline (from merchandising_data.csv, AW25 W7) ──────────────────
CURRENT = {
    "portfolio": {"st": 45.9, "margin": 50.1},
    "by_category": {
        "Outerwear":   {"st": 42.7, "margin": 48.1},
        "Knitwear":    {"st": 46.4, "margin": 49.4},
        "Denim":       {"st": 46.9, "margin": 49.2},
        "Accessories": {"st": 46.4, "margin": 52.8},
        "Footwear":    {"st": 47.5, "margin": 52.6},
    }
}

CATEGORIES = ["Outerwear", "Knitwear", "Denim", "Accessories", "Footwear"]

def scale_st(base_st, week_now, week_then):
    """ST% scales with weeks elapsed (units sold proportional to velocity × weeks)."""
    return round(base_st * week_then / week_now, 1)

def scale_margin(base_margin, week_now, week_then, full_price_margin=55.0):
    """
    Margin degrades as the season progresses due to markdowns.
    At Week 1 it's near full-price-margin; by Week 7 it's base_margin.
    """
    fraction = week_then / week_now  # 0..1
    return round(full_price_margin - (full_price_margin - base_margin) * fraction, 1)

def build_category_snapshot(week_now, week_then, st_overrides=None, mg_overrides=None):
    cats = {}
    for c in CATEGORIES:
        base = CURRENT["by_category"][c]
        st = scale_st(base["st"], week_now, week_then)
        mg = scale_margin(base["margin"], week_now, week_then)
        if st_overrides and c in st_overrides:
            st = st_overrides[c]
        if mg_overrides and c in mg_overrides:
            mg = mg_overrides[c]
        cats[c] = {"st": st, "margin": mg}
    return cats

# ── Build all snapshots ───────────────────────────────────────────────────────

snapshots = []

# ── 7d ago: AW25 Week 6 ────────────────────────────────────────────────────
cats_w6 = build_category_snapshot(week_now=7, week_then=6)
snapshots.append({
    "period_id": "7d",
    "label": "7 days ago",
    "season_context": "AW25 · W6",
    "display_date": "Sep 2025",
    "portfolio": {
        "st": scale_st(45.9, 7, 6),
        "margin": scale_margin(50.1, 7, 6),
    },
    "by_category": cats_w6,
})

# ── 30d ago: AW25 Week 3 ───────────────────────────────────────────────────
cats_w3 = build_category_snapshot(week_now=7, week_then=3)
snapshots.append({
    "period_id": "30d",
    "label": "30 days ago",
    "season_context": "AW25 · W3",
    "portfolio": {
        "st": scale_st(45.9, 7, 3),
        "margin": scale_margin(50.1, 7, 3),
    },
    "by_category": cats_w3,
})

# ── 60d ago: AW25 Week 1 ───────────────────────────────────────────────────
cats_w1 = build_category_snapshot(week_now=7, week_then=1)
snapshots.append({
    "period_id": "60d",
    "label": "60 days ago",
    "season_context": "AW25 · W1",
    "portfolio": {
        "st": scale_st(45.9, 7, 1),
        "margin": scale_margin(50.1, 7, 1),
    },
    "by_category": cats_w1,
})

# ── 90d ago: SS25 Week 11 (end-of-season clearance) ───────────────────────
# SS25 is spring/summer. At W11/12 it's clearance — high ST, low margin.
# Outerwear and heavy Knitwear barely move in SS; Accessories and Footwear lead.
snapshots.append({
    "period_id": "90d",
    "label": "90 days ago",
    "season_context": "SS25 · W11 (clearance)",
    "portfolio": {
        "st": 68.4,
        "margin": 38.2,
    },
    "by_category": {
        "Outerwear":   {"st": 52.1, "margin": 31.4},  # slow in summer, heavy markdowns
        "Knitwear":    {"st": 61.8, "margin": 35.0},  # cleared with effort
        "Denim":       {"st": 74.2, "margin": 39.8},  # denim runs year-round
        "Accessories": {"st": 79.6, "margin": 42.7},  # accessories led SS25
        "Footwear":    {"st": 82.3, "margin": 40.1},  # sandals/sneakers high sell
    },
})

# ── 180d ago: SS25 Week 7 (mid-season, comparable selling week) ────────────
# ST is lower than W11 but margin healthier (fewer markdowns yet).
snapshots.append({
    "period_id": "180d",
    "label": "180 days ago",
    "season_context": "SS25 · W7",
    "portfolio": {
        "st": 43.1,
        "margin": 47.6,
    },
    "by_category": {
        "Outerwear":   {"st": 29.4, "margin": 44.8},  # low for summer outerwear
        "Knitwear":    {"st": 38.2, "margin": 46.5},  # light knits doing ok
        "Denim":       {"st": 47.8, "margin": 48.2},
        "Accessories": {"st": 54.1, "margin": 51.3},
        "Footwear":    {"st": 55.6, "margin": 50.9},
    },
})

# ── Same season LY: AW24 Week 7 ───────────────────────────────────────────
# Slightly lower ST (harder trading year, AW24 was competitive).
# Margin slightly better (less promotional — fewer tactical markdowns).
snapshots.append({
    "period_id": "LY",
    "label": "Same season LY",
    "season_context": "AW24 · W7",
    "portfolio": {
        "st": 41.3,
        "margin": 52.4,
    },
    "by_category": {
        "Outerwear":   {"st": 38.9, "margin": 51.2},
        "Knitwear":    {"st": 40.6, "margin": 51.8},
        "Denim":       {"st": 43.1, "margin": 51.4},
        "Accessories": {"st": 43.8, "margin": 54.6},
        "Footwear":    {"st": 44.2, "margin": 55.1},
    },
})

# ── Output ────────────────────────────────────────────────────────────────
output = {
    "current": {
        "period_id": "now",
        "label": "Now",
        "season_context": "AW25 · W7",
        "portfolio": CURRENT["portfolio"],
        "by_category": CURRENT["by_category"],
    },
    "snapshots": snapshots,
}

out_path = "/Users/astro/uipath_ dataviz_problem/public/historical_data.json"
with open(out_path, "w") as f:
    json.dump(output, f, indent=2)

print(f"Written → {out_path}")
print(f"\nCurrent:  ST={CURRENT['portfolio']['st']}%  Margin={CURRENT['portfolio']['margin']}%")
print()
for s in snapshots:
    p = s["portfolio"]
    st_delta = round(p["st"] - CURRENT["portfolio"]["st"], 1)
    mg_delta = round(p["margin"] - CURRENT["portfolio"]["margin"], 1)
    st_sign = "+" if st_delta >= 0 else ""
    mg_sign = "+" if mg_delta >= 0 else ""
    print(f"{s['period_id']:<6} [{s['season_context']:<18}]  ST={p['st']}% ({st_sign}{st_delta}pp)  Margin={p['margin']}% ({mg_sign}{mg_delta}pp)")
