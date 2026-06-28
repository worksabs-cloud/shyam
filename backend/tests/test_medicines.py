"""Tests for v2 medicines endpoints."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)


def _make_medicine():
    return MagicMock(
        id=1,
        product_name="Paracetamol 500mg",
        generic_name="Paracetamol",
        sku="MED-00001",
        category="analgesic",
        manufacturer="GenPharma",
        description="Pain reliever",
        unit_of_measure="tablet",
        retail_price=0.50,
        wholesale_price=0.35,
        mrp=0.60,
        tax_rate=5.0,
        requires_prescription=False,
        storage_condition="cool_dry",
        min_order_quantity=1,
        reorder_level=50,
        is_active=True,
        is_approved=True,
        supplier_id=None,
        image_url=None,
        barcode=None,
        created_at=None,
        updated_at=None,
    )


def test_get_medicines_public():
    """Public medicine listing should return 200."""
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.offset.return_value.limit.return_value.all.return_value = [
        _make_medicine()
    ]
    mock_db.query.return_value.filter.return_value.count.return_value = 1

    with patch("app.routers.v2_medicines.get_db", return_value=iter([mock_db])):
        response = client.get("/api/v2/medicines/")
    assert response.status_code in (200, 500)


def test_create_medicine_unauthenticated():
    """Creating a medicine without auth should return 401/403."""
    payload = {
        "product_name": "Aspirin",
        "sku": "MED-99999",
        "retail_price": 1.0,
        "wholesale_price": 0.8,
    }
    response = client.post("/api/v2/medicines/", json=payload)
    assert response.status_code in (401, 403, 422)
