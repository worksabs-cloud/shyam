import random
import string
from datetime import datetime


def generate_sku(prefix: str = "MED") -> str:
    return f"{prefix}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"


def generate_invoice_number() -> str:
    return f"INV-{datetime.now().strftime('%Y%m%d')}-{''.join(random.choices(string.digits, k=4))}"


def format_currency(amount: float, currency: str = "USD") -> str:
    return f"{currency} {amount:.2f}"


def generate_po_number() -> str:
    return f"PO-{datetime.now().strftime('%Y%m%d')}-{''.join(random.choices(string.digits, k=5))}"
