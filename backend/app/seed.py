"""Seed data: admin user + realistic demo inventory and supplier catalog.

Run standalone:  python -m app.seed
On API startup:  seed_admin() is invoked automatically.
The /demo/load endpoint calls load_demo_data() for one-click demo setup.
"""
from datetime import date, timedelta

from .auth import hash_password
from .database import Base, SessionLocal, engine
from .models import (
    InventoryItem,
    Supplier,
    SupplierCatalog,
    User,
)
from .config import settings

TODAY = date.today()


def _d(days: int) -> date:
    return TODAY + timedelta(days=days)


# --- Demo inventory: engineered to showcase every risk category ---
DEMO_INVENTORY = [
    # name, stock, avg_daily_sales, category, expiry(days from today), unit_cost
    ("Amoxicillin 500mg", 40, 15, "Antibiotic", _d(60), 8.5),      # CRITICAL stockout (2.6d)
    ("Insulin Glargine", 18, 9, "Diabetes", _d(40), 42.0),          # CRITICAL (2d) + expiry warning
    ("Paracetamol 500mg", 100, 20, "Analgesic", _d(380), 6.0),      # HIGH (5d)
    ("Azithromycin 250mg", 55, 9, "Antibiotic", _d(25), 14.0),      # MEDIUM + expiry CRITICAL
    ("Metformin 850mg", 25, 12, "Diabetes", _d(500), 5.5),          # HIGH (2d)
    ("Atorvastatin 20mg", 210, 14, "Cardiac", _d(700), 7.2),        # safe
    ("Amlodipine 5mg", 320, 18, "Cardiac", _d(600), 4.8),           # safe
    ("Omeprazole 20mg", 90, 16, "Gastro", _d(120), 6.4),            # medium
    ("Salbutamol Inhaler", 30, 6, "Respiratory", _d(20), 22.0),     # MEDIUM + expiry CRITICAL
    ("Cetirizine 10mg", 140, 10, "Antihistamine", _d(450), 3.2),    # low risk
    ("Vitamin C 500mg", 500, 0, "Supplement", _d(300), 2.5),        # DEAD STOCK (no movement)
    ("Cough Syrup 100ml", 260, 0.1, "Respiratory", _d(75), 9.0),    # DEAD STOCK + expiry warning
    ("Multivitamin Tablets", 800, 0, "Supplement", _d(900), 4.0),   # DEAD STOCK overstock
    ("Ciprofloxacin 500mg", 70, 8, "Antibiotic", _d(200), 11.5),    # medium
    ("Losartan 50mg", 45, 10, "Cardiac", _d(15), 6.8),              # HIGH + expiry CRITICAL
    ("Ibuprofen 400mg", 180, 22, "Analgesic", _d(250), 4.5),       # low
    ("Pantoprazole 40mg", 60, 14, "Gastro", _d(-5), 7.0),           # EXPIRED + high risk
    ("Levothyroxine 100mcg", 130, 9, "Thyroid", _d(420), 8.0),      # safe
    ("Aspirin 75mg", 240, 16, "Cardiac", _d(340), 2.0),             # safe
    ("Montelukast 10mg", 35, 7, "Respiratory", _d(85), 12.0),       # MEDIUM + expiry warning
]

# --- Demo supplier catalog: multiple suppliers per drug for comparison ---
DEMO_SUPPLIERS = [
    # medicine, supplier, unit_price, lead_time, available_qty
    ("Amoxicillin 500mg", "ABC Pharma", 8.5, 2, 1000),
    ("Amoxicillin 500mg", "XYZ Distributors", 7.9, 3, 2000),
    ("Amoxicillin 500mg", "MedLine Supply", 8.2, 1, 800),
    ("Insulin Glargine", "ColdChain Pharma", 42.0, 3, 300),
    ("Insulin Glargine", "ABC Pharma", 44.5, 2, 200),
    ("Paracetamol 500mg", "ABC Pharma", 6.0, 2, 5000),
    ("Paracetamol 500mg", "XYZ Distributors", 5.4, 3, 8000),
    ("Azithromycin 250mg", "MedLine Supply", 14.0, 2, 1200),
    ("Azithromycin 250mg", "XYZ Distributors", 13.2, 4, 1500),
    ("Metformin 850mg", "ABC Pharma", 5.5, 2, 4000),
    ("Metformin 850mg", "Generix Health", 5.1, 3, 6000),
    ("Atorvastatin 20mg", "Generix Health", 7.2, 3, 3000),
    ("Amlodipine 5mg", "ABC Pharma", 4.8, 2, 5000),
    ("Omeprazole 20mg", "XYZ Distributors", 6.4, 3, 4000),
    ("Salbutamol Inhaler", "MedLine Supply", 22.0, 2, 600),
    ("Salbutamol Inhaler", "ColdChain Pharma", 21.0, 4, 900),
    ("Cetirizine 10mg", "Generix Health", 3.2, 3, 7000),
    ("Ciprofloxacin 500mg", "MedLine Supply", 11.5, 2, 1500),
    ("Ciprofloxacin 500mg", "ABC Pharma", 10.9, 3, 1200),
    ("Losartan 50mg", "Generix Health", 6.8, 3, 3500),
    ("Losartan 50mg", "ABC Pharma", 7.1, 2, 2000),
    ("Ibuprofen 400mg", "XYZ Distributors", 4.5, 3, 9000),
    ("Pantoprazole 40mg", "Generix Health", 7.0, 3, 2500),
    ("Levothyroxine 100mcg", "ColdChain Pharma", 8.0, 3, 1800),
    ("Aspirin 75mg", "ABC Pharma", 2.0, 2, 10000),
    ("Montelukast 10mg", "MedLine Supply", 12.0, 2, 1100),
]


def seed_admin() -> None:
    """Ensure the admin user exists."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == settings.admin_username).first()
        if not existing:
            db.add(
                User(
                    username=settings.admin_username,
                    full_name="Pharmacy Administrator",
                    role="admin",
                    password_hash=hash_password(settings.admin_password),
                )
            )
            db.commit()
            print(f"[seed] admin user '{settings.admin_username}' created")
    finally:
        db.close()


def load_demo_data(db) -> dict:
    """Wipe + load demo inventory and suppliers. Returns counts."""
    db.query(SupplierCatalog).delete()
    db.query(Supplier).delete()
    db.query(InventoryItem).delete()
    db.commit()

    for name, stock, sales, cat, exp, cost in DEMO_INVENTORY:
        db.add(
            InventoryItem(
                medicine_name=name,
                current_stock=stock,
                avg_daily_sales=sales,
                category=cat,
                expiry_date=exp,
                unit_cost=cost,
            )
        )

    suppliers_cache: dict[str, Supplier] = {}
    for med, sup_name, price, lead, qty in DEMO_SUPPLIERS:
        sup = suppliers_cache.get(sup_name)
        if not sup:
            sup = db.query(Supplier).filter(Supplier.name == sup_name).first()
            if not sup:
                sup = Supplier(name=sup_name, rating=round(4.0 + (len(sup_name) % 5) / 10, 1))
                db.add(sup)
                db.flush()
            suppliers_cache[sup_name] = sup
        db.add(
            SupplierCatalog(
                supplier_id=sup.id,
                supplier_name=sup_name,
                medicine_name=med,
                unit_price=price,
                lead_time_days=lead,
                available_quantity=qty,
            )
        )
    db.commit()
    return {"inventory": len(DEMO_INVENTORY), "catalog": len(DEMO_SUPPLIERS)}


def main() -> None:
    seed_admin()
    db = SessionLocal()
    try:
        counts = load_demo_data(db)
        print(f"[seed] demo data loaded: {counts}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
