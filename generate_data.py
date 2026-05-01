"""
Synthetic merchandising dataset for dashboard demo.
Season: 12 weeks total, currently at Week 7. Weeks remaining: 5.
ST target at Week 7: 58% (7/12).
50 SKUs across 5 categories, pre-seeded with all 4 root-cause scenarios.
"""

import csv
import math

SEASON_WEEK = 7
TOTAL_WEEKS = 12
WEEKS_REMAINING = TOTAL_WEEKS - SEASON_WEEK  # 5
ST_TARGET = round(SEASON_WEEK / TOTAL_WEEKS, 2)  # 0.58

def margin(current_price, cost):
    return round((current_price - cost) / current_price * 100, 1)

def wos(on_hand, velocity):
    if velocity == 0:
        return 99.0
    return round(on_hand / velocity, 1)

def urgency_gap(weeks_of_supply, weeks_rem):
    return round(weeks_of_supply - weeks_rem, 1)

def st_pct(units_sold, opening):
    return round(units_sold / opening * 100, 1)

def st_gap(actual, target_pct=ST_TARGET * 100):
    return round(actual - target_pct, 1)

# Each row: (sku_id, product_name, category, opening_inventory, units_sold,
#            weekly_velocity, original_price, current_price,
#            days_since_last_markdown, prior_markdown_taken,
#            store_st_high, store_st_low,
#            ai_diagnosis, recommended_action,
#            projected_st_lift_pct, projected_margin_impact_pts,
#            notes)

RAW = [
    # ── OUTERWEAR ─────────────────────────────────────────────────────────────
    ("OW-001", "Puffer Jacket Black",      "Outerwear",  120,  94, 13.0, 189, 189,  0, False, 88, 72, "On Track",       "Consider Reorder",  0,   0,  "Strong velocity, near sellout"),
    ("OW-002", "Wool Overcoat Camel",      "Outerwear",   80,  22,  3.2, 299, 299, 42, False, 34, 22, "Wrong Price",    "Markdown 15%",     14,  -8,  "No markdown in 42d, margin healthy"),
    ("OW-003", "Quilted Vest Navy",        "Outerwear",  200,  44,  6.0, 129, 129,  7, False, 68,  8, "Wrong Location", "Redistribute",     18,   0,  "68% ST in top stores, 8% in others"),
    ("OW-004", "Bomber Jacket Olive",      "Outerwear",   95,  81, 11.5, 159,  95, 14, True,  91, 79, "Over-discounted","Hold / Learn",      0,   0,  "40% off taken too early"),
    ("OW-005", "Puffer Vest Coral",        "Outerwear",  110,  26,  3.7,  99,  69, 10, True,  28, 18, "Wrong Product",  "Promote / Bundle",  9,  -4,  "30% off, still not moving"),
    ("OW-006", "Trench Coat Beige",        "Outerwear",   65,  37,  5.3, 249, 249,  0, False, 63, 51, "On Track",       "Wait",              0,   0,  "1pt below target, no action needed"),
    ("OW-007", "Longline Coat Black",      "Outerwear",   55,  14,  2.0, 349, 349, 56, False, 30, 20, "Wrong Price",    "Markdown 15%",     13,  -8,  "No markdown in 56d, high price point"),
    ("OW-008", "Sherpa Jacket Cream",      "Outerwear",  140,  35,  5.0, 149, 149, 14, False, 72,  4, "Wrong Location", "Redistribute",     20,   0,  "72% ST vs 4% ST across doors"),
    ("OW-009", "Windbreaker Navy",         "Outerwear",   88,  53,  7.6, 119, 119,  0, False, 67, 53, "On Track",       "Wait",              0,   0,  "+2pts above target"),
    ("OW-010", "Faux Leather Jacket Brown","Outerwear",   75,  17,  2.4, 179, 125, 21, True,  27, 19, "Wrong Product",  "Promote / Bundle", 10,  -4,  "30% off, uniform low ST all doors"),

    # ── KNITWEAR ──────────────────────────────────────────────────────────────
    ("KN-001", "Oversized Hoodie Grey",    "Knitwear",   180, 148, 21.0,  89,  89,  0, False, 89, 75, "On Track",       "Consider Reorder",  0,   0,  "Best performer, near sellout"),
    ("KN-002", "Ribbed Turtleneck Cream",  "Knitwear",    95,  29,  4.1,  79,  79, 28, False, 37, 25, "Wrong Price",    "Markdown 15%",     14,  -8,  "28d no markdown, margin 55%"),
    ("KN-003", "Cropped Cardigan Pink",    "Knitwear",   120,  23,  3.3,  69,  49, 18, True,  23, 15, "Wrong Product",  "Bundle / Clear",    8,  -5,  "29% off, no velocity response"),
    ("KN-004", "Crew Neck Sweater Charcoal","Knitwear",  110,  65,  9.3,  99,  99,  0, False, 65, 53, "On Track",       "Wait",              0,   0,  "+1pt above target"),
    ("KN-005", "V-Neck Pullover Burgundy", "Knitwear",    75,  42,  6.0,  85,  85,  0, False, 61, 51, "On Track",       "Wait",              0,   0,  "-2pts below target, within range"),
    ("KN-006", "Chunky Knit Vest Oatmeal", "Knitwear",   130,  32,  4.6,  95,  95,  7, False, 65,  6, "Wrong Location", "Redistribute",     19,   0,  "65% vs 6% across doors"),
    ("KN-007", "Ribbed Cardigan Ivory",    "Knitwear",   100,  88, 12.6,  89,  53, 21, True,  93, 83, "Over-discounted","Hold / Learn",      0,   0,  "40% off, near sellout but margin gone"),
    ("KN-008", "Mock Neck Sweater Forest", "Knitwear",    60,  17,  2.4, 109, 109, 35, False, 33, 23, "Wrong Price",    "Markdown 15%",     13,  -8,  "35d no markdown"),
    ("KN-009", "Cable Knit Hoodie Brown",  "Knitwear",    85,  51,  7.3, 115, 115,  0, False, 66, 54, "On Track",       "Wait",              0,   0,  "+2pts above target"),
    ("KN-010", "Striped Knit Top Navy",    "Knitwear",    90,  21,  3.0,  65,  46, 24, True,  27, 18, "Wrong Product",  "Bundle / Clear",    9,  -4,  "29% off, uniform slow across doors"),
    ("KN-011", "Thermal Henley White",     "Knitwear",   150,  90, 12.9,  55,  55,  0, False, 66, 54, "On Track",       "Wait",              0,   0,  "+2pts above target"),
    ("KN-012", "Zip-Up Fleece Sage",       "Knitwear",   105,  27,  3.9,  79,  79,  3, False, 61,  5, "Wrong Location", "Redistribute",     17,   0,  "61% vs 5% across doors"),

    # ── DENIM ─────────────────────────────────────────────────────────────────
    ("DN-001", "Mom Jeans Light Wash",     "Denim",      200, 150, 21.4,  89,  89,  0, False, 82, 68, "On Track",       "Consider Reorder",  0,   0,  "Top denim performer"),
    ("DN-002", "Slim Jeans Dark Wash",     "Denim",      175,  46,  6.6,  95,  95,  3, False, 71,  7, "Wrong Location", "Redistribute",     20,   0,  "71% vs 7% across doors"),
    ("DN-003", "Wide Leg Jeans Ecru",      "Denim",      130,  29,  4.1,  99,  69, 14, True,  26, 17, "Wrong Product",  "Bundle / Clear",    8,  -5,  "30% off, no movement"),
    ("DN-004", "Straight Jeans Indigo",    "Denim",      160,  90, 12.9,  89,  89,  0, False, 62, 50, "On Track",       "Wait",              0,   0,  "-2pts below target, fine"),
    ("DN-005", "Boyfriend Jeans Mid Wash", "Denim",       90,  25,  3.6, 109, 109, 42, False, 33, 23, "Wrong Price",    "Markdown 15%",     14,  -8,  "42d no markdown"),
    ("DN-006", "Denim Mini Skirt Blue",    "Denim",       85,  51,  7.3,  69,  69,  0, False, 66, 54, "On Track",       "Wait",              0,   0,  "+2pts above target"),
    ("DN-007", "High Rise Flare Jeans Black","Denim",    120,  92, 13.1, 119, 119,  0, False, 84, 70, "On Track",       "Consider Reorder",  0,   0,  "+19pts above target"),
    ("DN-008", "Cargo Pants Khaki",        "Denim",       95,  22,  3.1,  89,  62, 28, True,  27, 16, "Wrong Product",  "Bundle / Clear",    9,  -4,  "30% off, still flat"),
    ("DN-009", "Linen Blend Trouser Ecru", "Denim",       70,  38,  5.4,  75,  75,  0, False, 59, 49, "On Track",       "Wait",              0,   0,  "-4pts below target, within range"),
    ("DN-010", "Denim Jacket Vintage Wash","Denim",       80,  70, 10.0, 129,  77, 21, True,  92, 84, "Over-discounted","Hold / Learn",      0,   0,  "40% off taken too early"),
    ("DN-011", "Wide Leg Trousers Black",  "Denim",      110,  28,  4.0,  85,  85,  7, False, 63,  5, "Wrong Location", "Redistribute",     18,   0,  "63% vs 5% across doors"),
    ("DN-012", "Pleated Midi Skirt Tan",   "Denim",       65,  18,  2.6,  95,  95, 31, False, 33, 22, "Wrong Price",    "Markdown 15%",     13,  -8,  "31d no markdown"),

    # ── ACCESSORIES ───────────────────────────────────────────────────────────
    ("AC-001", "Wool Scarf Plaid",         "Accessories",150, 118, 16.9,  49,  49,  0, False, 85, 73, "On Track",       "Consider Reorder",  0,   0,  "Near sellout"),
    ("AC-002", "Leather Belt Brown",       "Accessories",100,  25,  3.6,  59,  59, 42, False, 30, 20, "Wrong Price",    "Markdown 15%",     14,  -8,  "42d no markdown"),
    ("AC-003", "Canvas Tote Natural",      "Accessories",120,  73, 10.4,  39,  39,  0, False, 67, 55, "On Track",       "Wait",              0,   0,  "+3pts above target"),
    ("AC-004", "Bucket Hat Tan",           "Accessories",140,  30,  4.3,  35,  35,  3, False, 66,  4, "Wrong Location", "Redistribute",     21,   0,  "66% vs 4% across doors"),
    ("AC-005", "Mini Crossbody Black",     "Accessories", 80,  62,  8.9,  79,  79,  0, False, 84, 72, "On Track",       "Consider Reorder",  0,   0,  "+20pts above target"),
    ("AC-006", "Beanie Ribbed Charcoal",   "Accessories",200,  47,  6.7,  25,  18, 21, True,  29, 19, "Wrong Product",  "Bundle / Clear",    8,  -4,  "28% off, uniform slow"),
    ("AC-007", "Silk Headband Floral",     "Accessories", 90,  23,  3.3,  29,  29, 35, False, 31, 21, "Wrong Price",    "Markdown 15%",     13,  -8,  "35d no markdown"),
    ("AC-008", "Woven Straw Bag Natural",  "Accessories", 60,  35,  5.0,  65,  65,  0, False, 64, 52, "On Track",       "Wait",              0,   0,  "Exactly on target"),

    # ── FOOTWEAR ──────────────────────────────────────────────────────────────
    ("FW-001", "Chelsea Boot Tan",         "Footwear",    90,  68,  9.7, 179, 179,  0, False, 82, 70, "On Track",       "Consider Reorder",  0,   0,  "+18pts above target"),
    ("FW-002", "Ankle Boot Black",         "Footwear",    75,  22,  3.1, 199, 199, 30, False, 35, 23, "Wrong Price",    "Markdown 15%",     13,  -8,  "30d no markdown, high ASP"),
    ("FW-003", "Platform Sneaker White",   "Footwear",   160,  44,  6.3, 129, 129,  7, False, 69,  7, "Wrong Location", "Redistribute",     19,   0,  "69% vs 7% across doors"),
    ("FW-004", "Loafer Cognac",            "Footwear",    70,  42,  6.0, 149, 149,  0, False, 66, 54, "On Track",       "Wait",              0,   0,  "+2pts above target"),
    ("FW-005", "Running Sneaker Grey",     "Footwear",   110,  26,  3.7, 119,  83, 21, True,  28, 18, "Wrong Product",  "Bundle / Clear",    9,  -4,  "30% off, no response"),
    ("FW-006", "Slide Sandal Tan",         "Footwear",   130,  78, 11.1,  59,  59,  0, False, 66, 54, "On Track",       "Wait",              0,   0,  "+2pts above target"),
    ("FW-007", "Heeled Mule Black",        "Footwear",    55,  15,  2.1, 169, 169, 45, False, 32, 22, "Wrong Price",    "Markdown 15%",     14,  -8,  "45d no markdown"),
    ("FW-008", "Combat Boot Olive",        "Footwear",    85,  65,  9.3, 189, 189,  0, False, 82, 70, "On Track",       "Consider Reorder",  0,   0,  "+18pts above target"),
]

FIELDS = [
    "sku_id", "product_name", "category",
    "season_week", "total_season_weeks", "weeks_remaining",
    "opening_inventory", "units_sold", "units_on_hand",
    "weekly_velocity",
    "sell_through_pct", "st_target_pct", "st_gap",
    "original_price", "current_price", "cost_price",
    "gross_margin_pct",
    "days_since_last_markdown", "prior_markdown_taken",
    "store_st_high", "store_st_low", "store_st_variance",
    "weeks_of_supply", "urgency_gap",
    "urgency_label",
    "ai_diagnosis", "recommended_action",
    "projected_st_lift_pct", "projected_margin_impact_pts",
    "notes",
]

def urgency_label(gap):
    if gap >= 10:
        return "Critical"
    elif gap >= 3:
        return "Watch"
    elif gap >= -1:
        return "OK"
    else:
        return "Reorder"

rows = []
for r in RAW:
    (sku_id, product_name, category,
     opening, sold, velocity,
     orig_price, curr_price,
     days_markdown, prior_md,
     st_high, st_low,
     diagnosis, action,
     proj_st, proj_margin,
     notes) = r

    on_hand    = opening - sold
    cost       = round(orig_price * 0.45, 2)
    gm         = margin(curr_price, cost)
    st         = st_pct(sold, opening)
    st_t       = round(ST_TARGET * 100, 1)
    st_g       = st_gap(st, st_t)
    w_supply   = wos(on_hand, velocity)
    u_gap      = urgency_gap(w_supply, WEEKS_REMAINING)
    u_label    = urgency_label(u_gap)
    variance   = st_high - st_low

    rows.append([
        sku_id, product_name, category,
        SEASON_WEEK, TOTAL_WEEKS, WEEKS_REMAINING,
        opening, sold, on_hand,
        velocity,
        st, st_t, st_g,
        orig_price, curr_price, cost,
        gm,
        days_markdown, prior_md,
        st_high, st_low, variance,
        w_supply, u_gap,
        u_label,
        diagnosis, action,
        proj_st, proj_margin,
        notes,
    ])

output_path = "/Users/astro/uipath_ dataviz_problem/merchandising_data.csv"
with open(output_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(FIELDS)
    writer.writerows(rows)

print(f"Generated {len(rows)} SKUs → {output_path}")

# Print scenario summary
from collections import Counter
diagnoses = Counter(r[25] for r in rows)
print("\nScenario breakdown:")
for k, v in sorted(diagnoses.items(), key=lambda x: -x[1]):
    print(f"  {k:<20} {v} SKUs")
