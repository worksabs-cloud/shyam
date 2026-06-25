from sqlalchemy.orm import Session
from app.config import settings
from app.models.medicine import Medicine
from app.models.inventory import Inventory, InventoryBatch
from app.models.order import Order, OrderItem
from datetime import date, timedelta
from typing import List, Dict
import json


def _get_openai_client():
    try:
        from openai import OpenAI
        return OpenAI(api_key=settings.OPENAI_API_KEY or settings.openai_api_key)
    except Exception:
        return None


def ai_smart_search(db: Session, query: str) -> Dict:
    medicines = db.query(Medicine).filter(Medicine.is_active == True).limit(200).all()
    medicine_list = [
        {"id": m.id, "name": m.product_name, "generic": m.generic_name, "category": str(m.category)}
        for m in medicines
    ]

    client = _get_openai_client()
    if client and (settings.OPENAI_API_KEY or settings.openai_api_key):
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a pharmacy search assistant. Given a natural language query and a list of medicines, return the IDs of matching medicines as a JSON array. Only return a JSON array of IDs."},
                    {"role": "user", "content": f"Query: {query}\n\nMedicines: {json.dumps(medicine_list[:50])}"}
                ],
                max_tokens=500
            )
            ids = json.loads(response.choices[0].message.content)
            return {"ids": ids, "query": query}
        except Exception:
            pass

    # Fallback: simple text search
    query_lower = query.lower()
    matched_ids = [
        m["id"] for m in medicine_list
        if query_lower in (m["name"] or "").lower()
        or query_lower in (m["generic"] or "").lower()
    ]
    return {"ids": matched_ids, "query": query}


def get_demand_forecast(db: Session, medicine_id: int) -> Dict:
    from sqlalchemy import func
    recent_orders = db.query(
        func.sum(OrderItem.quantity).label("total_qty"),
        func.count(OrderItem.id).label("order_count")
    ).filter(OrderItem.medicine_id == medicine_id).first()

    inventory = db.query(Inventory).filter(Inventory.medicine_id == medicine_id).first()
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()

    data = {
        "medicine_name": medicine.product_name if medicine else "",
        "current_stock": inventory.total_quantity if inventory else 0,
        "reorder_level": inventory.reorder_level if inventory else 10,
        "total_orders": recent_orders.order_count or 0,
        "total_qty_sold": int(recent_orders.total_qty or 0)
    }

    client = _get_openai_client()
    if client and (settings.OPENAI_API_KEY or settings.openai_api_key):
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a pharmacy inventory AI. Analyze the data and provide demand forecast as JSON with fields: predicted_demand_30days, reorder_recommended (bool), recommended_quantity, risk_level (low/medium/high), insights (string)."},
                    {"role": "user", "content": f"Medicine data: {json.dumps(data)}"}
                ],
                max_tokens=500
            )
            forecast = json.loads(response.choices[0].message.content)
            return {**data, **forecast}
        except Exception:
            pass

    avg_daily = data["total_qty_sold"] / 30 if data["total_qty_sold"] else 1
    return {
        **data,
        "predicted_demand_30days": int(avg_daily * 30),
        "reorder_recommended": data["current_stock"] <= data["reorder_level"],
        "recommended_quantity": max(100, int(avg_daily * 60)),
        "risk_level": "high" if data["current_stock"] <= data["reorder_level"] else "low",
        "insights": "Based on historical sales data"
    }


def get_expiry_risk_report(db: Session) -> List[Dict]:
    threshold_90 = date.today() + timedelta(days=90)
    batches = db.query(InventoryBatch).filter(
        InventoryBatch.expiry_date <= threshold_90,
        InventoryBatch.quantity_available > 0
    ).all()

    result = []
    for batch in batches:
        days_to_expiry = (batch.expiry_date - date.today()).days
        risk = "critical" if days_to_expiry <= 30 else "high" if days_to_expiry <= 60 else "medium"
        result.append({
            "batch_id": batch.id,
            "medicine_id": batch.medicine_id,
            "batch_number": batch.batch_number,
            "expiry_date": str(batch.expiry_date),
            "quantity_available": batch.quantity_available,
            "days_to_expiry": days_to_expiry,
            "risk_level": risk,
            "recommendation": "Immediate discount sale" if risk == "critical" else "Promote sales" if risk == "high" else "Monitor closely"
        })

    return sorted(result, key=lambda x: x["days_to_expiry"])


def get_reorder_recommendations(db: Session) -> List[Dict]:
    low_stock = db.query(Medicine, Inventory).join(
        Inventory, Medicine.id == Inventory.medicine_id
    ).filter(
        Inventory.total_quantity <= Inventory.reorder_level,
        Medicine.is_active == True
    ).all()

    recommendations = []
    for medicine, inventory in low_stock:
        recommendations.append({
            "medicine_id": medicine.id,
            "medicine_name": medicine.product_name,
            "current_stock": inventory.total_quantity,
            "reorder_level": inventory.reorder_level,
            "recommended_quantity": inventory.max_stock_level - inventory.total_quantity,
            "supplier_id": medicine.supplier_id,
            "urgency": "critical" if inventory.total_quantity == 0 else "high"
        })

    return recommendations
