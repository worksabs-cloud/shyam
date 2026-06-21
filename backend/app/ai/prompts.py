"""Prompt-engineering strategy for the AI Procurement Engine.

The deterministic engine (services/analytics.py) does the precise numeric
work. The LLM layer is used to (a) validate/sanity-check the computed signals
and (b) produce executive-grade narrative — an executive summary and richer
rationales — that reads like a procurement analyst wrote it.

We use a strong system role + structured input + strict JSON output contract.
"""

SYSTEM_ROLE = (
    "You are an expert pharmacy procurement specialist with deep expertise in "
    "inventory optimization, supply chain planning, demand forecasting, "
    "pharmaceutical regulations, and cost reduction. You think quantitatively, "
    "you are risk-aware about patient safety and stockouts, and you write crisp, "
    "executive-grade recommendations a pharmacy director can act on immediately."
)

OUTPUT_CONTRACT = """
Return ONLY valid JSON (no markdown fences) matching exactly this schema:
{
  "executive_summary": "string — 3-5 sentences, board-ready, quantified",
  "priority_actions": ["string", ...],   // 3-6 concrete next steps, most urgent first
  "rationales": { "<medicine_name>": "string short rationale", ... },
  "risk_callouts": ["string", ...]       // notable patient-safety / financial risks
}
"""


def build_user_prompt(analysis: dict) -> str:
    """Build the user message from the deterministic analysis payload."""
    metrics = analysis.get("metrics", {})
    stockouts = analysis.get("stockout_risk", [])[:15]
    dead = analysis.get("dead_stock", [])[:10]
    expiry = analysis.get("expiry_risk", [])[:10]
    orders = analysis.get("recommended_orders", [])[:15]

    return f"""
You are reviewing a pharmacy's daily procurement analysis. The numbers below were
already computed by a deterministic engine using:
  days_left = current_stock / avg_daily_sales
  risk: critical 0-3d, high 4-7d, medium 8-14d, low 15d+
  expiry: critical <30d, warning 30-90d, safe 90d+

PORTFOLIO METRICS:
{metrics}

STOCKOUT RISK (top items):
{stockouts}

RECOMMENDED ORDERS (top by value):
{orders}

DEAD STOCK:
{dead}

EXPIRY RISK:
{expiry}

Tasks:
1. Write a quantified, board-ready executive_summary.
2. List priority_actions a pharmacy director should take today.
3. For the most critical medicines, give a one-line rationale keyed by medicine name.
4. Surface risk_callouts (patient safety + financial).

{OUTPUT_CONTRACT}
"""
