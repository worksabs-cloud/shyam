"""Tests for v2 order endpoints."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)


def test_create_order_unauthenticated():
    """Creating an order without auth should be rejected."""
    payload = {
        "order_type": "b2c",
        "items": [{"medicine_id": 1, "quantity": 2}],
    }
    response = client.post("/api/v2/orders/", json=payload)
    assert response.status_code in (401, 403, 422)


def test_get_orders_unauthenticated():
    """Listing orders without auth should be rejected."""
    response = client.get("/api/v2/orders/")
    assert response.status_code in (401, 403)


def test_order_status_update_unauthenticated():
    """Updating order status without auth should be rejected."""
    response = client.patch("/api/v2/orders/1/status", json={"status": "shipped"})
    assert response.status_code in (401, 403, 422)
