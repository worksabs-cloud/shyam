"""AI Procurement Engine — orchestrates deterministic analysis + optional LLM.

Flow:
  1. Run the deterministic engine (always) -> full structured JSON.
  2. If an OpenAI API key is configured, call the model to enrich the
     executive summary, priority actions, and per-medicine rationales.
  3. Gracefully fall back to the deterministic narrative on any error so the
     demo never breaks in front of judges.
"""
from __future__ import annotations

import json
from typing import Any

from ..config import settings
from ..services import analytics
from . import prompts


def _enrich_with_llm(analysis: dict[str, Any]) -> dict[str, Any] | None:
    """Call OpenAI to produce executive narrative. Returns None on failure."""
    if not settings.openai_api_key:
        return None
    try:
        from openai import OpenAI

        client = OpenAI(api_key=settings.openai_api_key)
        resp = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": prompts.SYSTEM_ROLE},
                {"role": "user", "content": prompts.build_user_prompt(analysis)},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        content = resp.choices[0].message.content
        return json.loads(content)
    except Exception as exc:  # noqa: BLE001 — demo resilience
        print(f"[ai.engine] LLM enrichment skipped: {exc}")
        return None


def run_analysis(inventory: list[Any], catalog: list[Any]) -> dict[str, Any]:
    """Main entry point. Returns the full structured procurement intelligence."""
    analysis = analytics.analyze(inventory, catalog)
    analysis["ai_enhanced"] = False
    analysis["model_used"] = "deterministic-rule-engine"

    enrichment = _enrich_with_llm(analysis)
    if enrichment:
        analysis["ai_enhanced"] = True
        analysis["model_used"] = settings.openai_model
        if enrichment.get("executive_summary"):
            analysis["executive_summary"] = enrichment["executive_summary"]
        analysis["priority_actions"] = enrichment.get("priority_actions", [])
        analysis["risk_callouts"] = enrichment.get("risk_callouts", [])
        rationales = enrichment.get("rationales", {})
        # Merge LLM rationales into recommended orders
        for order in analysis.get("recommended_orders", []):
            r = rationales.get(order["medicine_name"])
            if r:
                order["rationale"] = r
    else:
        # Deterministic fallback narrative for priority actions
        analysis["priority_actions"] = _fallback_actions(analysis)
        analysis["risk_callouts"] = _fallback_callouts(analysis)

    return analysis


def _fallback_actions(analysis: dict[str, Any]) -> list[str]:
    actions: list[str] = []
    crit = [s for s in analysis["stockout_risk"] if s["risk_level"] == "critical"]
    if crit:
        names = ", ".join(s["medicine_name"] for s in crit[:3])
        actions.append(f"Place emergency orders for critical SKUs today: {names}.")
    if analysis["recommended_orders"]:
        cost = analysis["metrics"]["estimated_reorder_cost"]
        actions.append(
            f"Approve the recommended reorder batch (${cost:,.2f}) covering "
            f"{len(analysis['recommended_orders'])} items."
        )
    if analysis["expiry_risk"]:
        actions.append(
            f"Action {len(analysis['expiry_risk'])} expiry-risk items: discount, "
            "dispense first, or transfer before write-off."
        )
    if analysis["dead_stock"]:
        actions.append(
            f"Freeze reordering on {len(analysis['dead_stock'])} dead-stock SKUs and "
            "launch a clearance campaign."
        )
    actions.append("Generate purchase orders for the optimized supplier per item.")
    return actions


def _fallback_callouts(analysis: dict[str, Any]) -> list[str]:
    callouts: list[str] = []
    m = analysis["metrics"]
    if m["risk_distribution"]["critical"]:
        callouts.append(
            f"PATIENT SAFETY: {m['risk_distribution']['critical']} medicines will "
            "stock out within 3 days."
        )
    if analysis["expiry_risk"]:
        exp_units = sum(e["current_stock"] for e in analysis["expiry_risk"])
        callouts.append(
            f"FINANCIAL: {int(exp_units):,} units at expiry risk — potential write-off."
        )
    if analysis["dead_stock"]:
        callouts.append(
            f"CAPITAL: {len(analysis['dead_stock'])} dead-stock SKUs are tying up "
            "working capital."
        )
    return callouts
