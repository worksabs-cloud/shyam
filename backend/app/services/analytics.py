"""Deterministic procurement intelligence engine.

This module implements the full analytical logic specified for the AI
Procurement Engine: days-of-cover, stockout risk classification, demand
forecasting, reorder quantity recommendation, cheapest-supplier selection,
substitute suggestions, dead-stock and expiry-risk detection.

It always produces the complete structured JSON output, so the platform is
fully functional even without an OpenAI key. The optional LLM layer (see
ai/engine.py) enriches the executive summary and rationales on top of this.
"""
from __future__ import annotations

from datetime import date
from typing import Any

# Risk thresholds (days of cover remaining)
RISK_CRITICAL = 3
RISK_HIGH = 7
RISK_MEDIUM = 14

# Expiry thresholds (days until expiry)
EXPIRY_CRITICAL = 30
EXPIRY_WARNING = 90

# Dead-stock thresholds
DEAD_STOCK_DAYS_OF_COVER = 120  # >120 days of stock at current movement
DEAD_STOCK_MIN_SALES = 0.2  # avg daily sales below this is "no movement"

# Reorder policy: target days of coverage when reordering
TARGET_COVER_DAYS = 21
SAFETY_DAYS = 7


def days_of_cover(current_stock: float, avg_daily_sales: float) -> float | None:
    """Days Left = Current Stock / Average Daily Sales."""
    if avg_daily_sales <= 0:
        return None  # no movement -> effectively infinite cover
    return round(current_stock / avg_daily_sales, 1)


def classify_risk(days_left: float | None) -> str:
    if days_left is None:
        return "none"
    if days_left <= RISK_CRITICAL:
        return "critical"
    if days_left <= RISK_HIGH:
        return "high"
    if days_left <= RISK_MEDIUM:
        return "medium"
    return "low"


def forecast_demand(avg_daily_sales: float) -> dict[str, float]:
    return {
        "demand_7d": round(avg_daily_sales * 7, 1),
        "demand_14d": round(avg_daily_sales * 14, 1),
        "demand_30d": round(avg_daily_sales * 30, 1),
    }


def recommend_reorder_qty(
    current_stock: float, avg_daily_sales: float, lead_time_days: int = 3
) -> int:
    """Order-up-to policy.

    Target level covers the lead time + a target operating window + safety
    stock. We never recommend negative quantities.
    """
    if avg_daily_sales <= 0:
        return 0
    target_level = avg_daily_sales * (lead_time_days + TARGET_COVER_DAYS + SAFETY_DAYS)
    qty = target_level - current_stock
    return max(0, int(round(qty)))


def days_until_expiry(expiry: date | None, today: date | None = None) -> int | None:
    if expiry is None:
        return None
    today = today or date.today()
    return (expiry - today).days


def classify_expiry(days: int | None) -> str:
    if days is None:
        return "unknown"
    if days < 0:
        return "expired"
    if days < EXPIRY_CRITICAL:
        return "critical"
    if days <= EXPIRY_WARNING:
        return "warning"
    return "safe"


def _supplier_options(catalog: list[Any], medicine: str) -> list[dict[str, Any]]:
    """Return all supplier offers for a medicine, ranked best-first.

    Scoring blends price (lower is better) and lead time (faster is better).
    """
    offers = [c for c in catalog if c.medicine_name.lower() == medicine.lower()]
    if not offers:
        return []
    prices = [o.unit_price for o in offers]
    leads = [o.lead_time_days for o in offers]
    pmin, pmax = min(prices), max(prices)
    lmin, lmax = min(leads), max(leads)

    ranked = []
    for o in offers:
        price_score = 1.0 if pmax == pmin else (pmax - o.unit_price) / (pmax - pmin)
        lead_score = 1.0 if lmax == lmin else (lmax - o.lead_time_days) / (lmax - lmin)
        score = round((0.7 * price_score + 0.3 * lead_score) * 100, 1)
        ranked.append(
            {
                "supplier_name": o.supplier_name,
                "unit_price": o.unit_price,
                "lead_time_days": o.lead_time_days,
                "available_quantity": o.available_quantity,
                "score": score,
            }
        )
    ranked.sort(key=lambda x: (-x["score"], x["unit_price"]))
    return ranked


def _find_substitutes(
    inventory: list[Any], item: Any, max_results: int = 3
) -> list[dict[str, Any]]:
    """Suggest in-stock alternatives in the same category with healthy cover."""
    subs = []
    for other in inventory:
        if other.id == item.id:
            continue
        if (other.category or "").lower() != (item.category or "").lower():
            continue
        cover = days_of_cover(other.current_stock, other.avg_daily_sales)
        if cover is None or cover >= RISK_MEDIUM:  # healthy alternative
            subs.append(
                {
                    "medicine_name": other.medicine_name,
                    "category": other.category,
                    "current_stock": other.current_stock,
                    "days_of_cover": cover,
                }
            )
    subs.sort(key=lambda x: -(x["current_stock"]))
    return subs[:max_results]


def analyze(inventory: list[Any], catalog: list[Any]) -> dict[str, Any]:
    """Run the full deterministic analysis and return the structured payload."""
    stockout_risk: list[dict[str, Any]] = []
    recommended_orders: list[dict[str, Any]] = []
    supplier_recommendations: list[dict[str, Any]] = []
    alternatives: list[dict[str, Any]] = []
    dead_stock: list[dict[str, Any]] = []
    expiry_risk: list[dict[str, Any]] = []

    total_reorder_cost = 0.0
    risk_distribution = {"critical": 0, "high": 0, "medium": 0, "low": 0, "none": 0}
    expiry_distribution = {
        "expired": 0,
        "critical": 0,
        "warning": 0,
        "safe": 0,
        "unknown": 0,
    }
    supplier_spend: dict[str, float] = {}

    for item in inventory:
        cover = days_of_cover(item.current_stock, item.avg_daily_sales)
        risk = classify_risk(cover)
        risk_distribution[risk] += 1
        forecast = forecast_demand(item.avg_daily_sales)

        best_offers = _supplier_options(catalog, item.medicine_name)
        best = best_offers[0] if best_offers else None
        lead = best["lead_time_days"] if best else 3

        # --- Stockout risk ---
        if risk in ("critical", "high", "medium"):
            stockout_risk.append(
                {
                    "medicine_name": item.medicine_name,
                    "category": item.category,
                    "current_stock": item.current_stock,
                    "avg_daily_sales": item.avg_daily_sales,
                    "days_left": cover,
                    "risk_level": risk,
                    "forecast": forecast,
                    "explanation": (
                        f"{item.medicine_name} is expected to stock out within "
                        f"~{cover} days based on current consumption of "
                        f"{item.avg_daily_sales} units/day."
                    ),
                }
            )

        # --- Recommended order ---
        if risk in ("critical", "high", "medium"):
            qty = recommend_reorder_qty(
                item.current_stock, item.avg_daily_sales, lead
            )
            if qty > 0 and best:
                line_cost = round(qty * best["unit_price"], 2)
                total_reorder_cost += line_cost
                supplier_spend[best["supplier_name"]] = (
                    supplier_spend.get(best["supplier_name"], 0) + line_cost
                )
                recommended_orders.append(
                    {
                        "medicine_name": item.medicine_name,
                        "category": item.category,
                        "current_stock": item.current_stock,
                        "recommended_quantity": qty,
                        "best_supplier": best["supplier_name"],
                        "unit_price": best["unit_price"],
                        "estimated_cost": line_cost,
                        "lead_time_days": best["lead_time_days"],
                        "risk_level": risk,
                        "rationale": (
                            f"Order {qty} units to restore ~{TARGET_COVER_DAYS}-day "
                            f"coverage plus {SAFETY_DAYS}-day safety stock and a "
                            f"{best['lead_time_days']}-day lead time buffer."
                        ),
                    }
                )

        # --- Supplier recommendation (comparison) ---
        if len(best_offers) >= 1:
            savings = 0.0
            if len(best_offers) >= 2:
                worst = max(o["unit_price"] for o in best_offers)
                savings = round(worst - best["unit_price"], 2)
            supplier_recommendations.append(
                {
                    "medicine_name": item.medicine_name,
                    "best_supplier": best["supplier_name"],
                    "best_price": best["unit_price"],
                    "best_score": best["score"],
                    "savings_per_unit": savings,
                    "options": best_offers,
                }
            )

        # --- Alternatives (only for at-risk items) ---
        if risk in ("critical", "high"):
            subs = _find_substitutes(inventory, item)
            if subs:
                alternatives.append(
                    {
                        "medicine_name": item.medicine_name,
                        "reason": f"{item.medicine_name} is at {risk} stockout risk.",
                        "substitutes": subs,
                    }
                )

        # --- Dead stock ---
        is_no_movement = item.avg_daily_sales <= DEAD_STOCK_MIN_SALES
        is_overstocked = cover is not None and cover >= DEAD_STOCK_DAYS_OF_COVER
        if (is_no_movement or is_overstocked) and item.current_stock > 0:
            dead_stock.append(
                {
                    "medicine_name": item.medicine_name,
                    "category": item.category,
                    "current_stock": item.current_stock,
                    "avg_daily_sales": item.avg_daily_sales,
                    "days_of_cover": cover,
                    "risk": "high" if is_no_movement else "medium",
                    "reason": (
                        "No measurable movement over the recent period."
                        if is_no_movement
                        else f"Severe overstock — ~{cover} days of cover on hand."
                    ),
                    "recommendation": (
                        "Stop reordering. Run a promotional campaign or transfer "
                        "inventory to a higher-demand location."
                    ),
                }
            )

        # --- Expiry risk ---
        d_exp = days_until_expiry(item.expiry_date)
        exp_cat = classify_expiry(d_exp)
        expiry_distribution[exp_cat] += 1
        if exp_cat in ("expired", "critical", "warning"):
            expiry_risk.append(
                {
                    "medicine_name": item.medicine_name,
                    "category": item.category,
                    "expiry_date": item.expiry_date.isoformat()
                    if item.expiry_date
                    else None,
                    "days_until_expiry": d_exp,
                    "level": exp_cat,
                    "current_stock": item.current_stock,
                    "recommendation": (
                        "Stop procurement immediately and run aggressive discounts "
                        "or transfer stock."
                        if exp_cat in ("critical", "expired")
                        else "Prioritise dispensing this batch; pause new procurement."
                    ),
                }
            )

    # Sort the at-risk lists so the most urgent surfaces first
    risk_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "none": 4}
    stockout_risk.sort(key=lambda x: (risk_order[x["risk_level"]], x["days_left"] or 0))
    recommended_orders.sort(key=lambda x: -x["estimated_cost"])
    expiry_risk.sort(key=lambda x: (x["days_until_expiry"] or 9999))

    supplier_summary = [
        {"supplier_name": k, "estimated_spend": round(v, 2)}
        for k, v in sorted(supplier_spend.items(), key=lambda kv: -kv[1])
    ]

    # Inventory health score (0-100): penalise critical/high risk + expiry issues
    total = max(1, len(inventory))
    penalty = (
        risk_distribution["critical"] * 3
        + risk_distribution["high"] * 2
        + risk_distribution["medium"] * 1
        + expiry_distribution["critical"] * 2
        + expiry_distribution["expired"] * 3
        + len(dead_stock) * 1.5
    )
    health_score = max(0, round(100 - (penalty / total) * 18, 1))

    summary = (
        f"Analyzed {len(inventory)} SKUs. {risk_distribution['critical']} items at "
        f"CRITICAL stockout risk and {risk_distribution['high']} at HIGH risk. "
        f"{len(dead_stock)} dead-stock items and {len(expiry_risk)} expiry-risk items "
        f"detected. Recommended immediate reorder value: ${round(total_reorder_cost, 2):,.2f}. "
        f"Overall inventory health score: {health_score}/100."
    )

    return {
        "stockout_risk": stockout_risk,
        "recommended_orders": recommended_orders,
        "supplier_recommendations": supplier_recommendations,
        "alternatives": alternatives,
        "dead_stock": dead_stock,
        "expiry_risk": expiry_risk,
        "executive_summary": summary,
        "metrics": {
            "items_analyzed": len(inventory),
            "estimated_reorder_cost": round(total_reorder_cost, 2),
            "health_score": health_score,
            "risk_distribution": risk_distribution,
            "expiry_distribution": expiry_distribution,
            "supplier_spend": supplier_summary,
        },
    }
