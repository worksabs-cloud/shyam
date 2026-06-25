"""Seed data for Nahid Pharmacy Distribution Platform."""
from app.database import SessionLocal
from app.models.user import User, UserRole, UserStatus
from app.models.medicine import Medicine, MedicineCategory, StorageCondition
from app.models.inventory import Inventory, InventoryBatch
from app.models.pharmacy import Pharmacy, Customer, Supplier
from app.utils.security import get_password_hash
from datetime import date, timedelta
import random


def seed_nahid_platform():
    db = SessionLocal()
    try:
        # Check if already seeded
        existing = db.query(User).filter(User.email == "nahid@admin.com").first()
        if existing:
            return

        print("[seed_v2] Seeding Nahid Pharmacy platform...")

        # Create admin user
        admin = User(
            email="nahid@admin.com",
            password_hash=get_password_hash("admin123"),
            first_name="Nahid",
            last_name="Admin",
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
            is_verified=True
        )
        db.add(admin)

        super_admin = User(
            email="superadmin@nahid.com",
            password_hash=get_password_hash("super123"),
            first_name="Super",
            last_name="Admin",
            role=UserRole.SUPER_ADMIN,
            status=UserStatus.ACTIVE,
            is_verified=True
        )
        db.add(super_admin)

        # Create supplier user
        supplier_user = User(
            email="supplier@nahid.com",
            password_hash=get_password_hash("supplier123"),
            first_name="Ahmed",
            last_name="Supplier",
            role=UserRole.SUPPLIER,
            status=UserStatus.ACTIVE,
            is_verified=True
        )
        db.add(supplier_user)
        db.flush()

        # Create supplier profile
        supplier = Supplier(
            user_id=supplier_user.id,
            company_name="Global Pharma Distributors",
            contact_person="Ahmed Rahman",
            email="supplier@nahid.com",
            phone="+8801711000001",
            city="Dhaka",
            state="Dhaka Division",
            is_approved=True,
            rating=4.5
        )
        db.add(supplier)
        db.flush()

        # Create pharmacy user
        pharmacy_user = User(
            email="pharmacy@nahid.com",
            password_hash=get_password_hash("pharmacy123"),
            first_name="Karim",
            last_name="Pharmacy",
            role=UserRole.PHARMACY,
            status=UserStatus.ACTIVE,
            is_verified=True
        )
        db.add(pharmacy_user)
        db.flush()

        # Create pharmacy profile
        pharmacy = Pharmacy(
            user_id=pharmacy_user.id,
            business_name="Karim Medical Hall",
            license_number="PHR-2024-001",
            city="Dhaka",
            state="Dhaka Division",
            is_approved=True,
            credit_limit=50000
        )
        db.add(pharmacy)

        # Create customer user
        customer_user = User(
            email="customer@nahid.com",
            password_hash=get_password_hash("customer123"),
            first_name="Sarah",
            last_name="Customer",
            role=UserRole.CUSTOMER,
            status=UserStatus.ACTIVE,
            is_verified=True
        )
        db.add(customer_user)
        db.flush()

        customer = Customer(
            user_id=customer_user.id,
            gender="female"
        )
        db.add(customer)

        # Create delivery agent user
        delivery_user = User(
            email="delivery@nahid.com",
            password_hash=get_password_hash("delivery123"),
            first_name="Rahim",
            last_name="Delivery",
            role=UserRole.DELIVERY_AGENT,
            status=UserStatus.ACTIVE,
            is_verified=True
        )
        db.add(delivery_user)
        db.flush()

        from app.models.delivery import DeliveryAgent
        agent = DeliveryAgent(
            user_id=delivery_user.id,
            vehicle_type="motorcycle",
            vehicle_number="DHK-2024-001",
            is_available=True,
            rating=4.8
        )
        db.add(agent)

        # Create sample medicines
        medicines_data = [
            {"product_name": "Paracetamol 500mg", "generic_name": "Paracetamol", "brand_name": "Napa",
             "sku": "MED-PARA-500", "manufacturer": "Beximco Pharma", "category": MedicineCategory.TABLET,
             "dosage": "500mg", "pack_size": "10 tablets/strip", "purchase_price": 0.80,
             "wholesale_price": 1.20, "retail_price": 2.50, "gst_percentage": 5.0},
            {"product_name": "Amoxicillin 250mg", "generic_name": "Amoxicillin", "brand_name": "Moxacil",
             "sku": "MED-AMOX-250", "manufacturer": "Square Pharma", "category": MedicineCategory.CAPSULE,
             "dosage": "250mg", "pack_size": "10 capsules/strip", "purchase_price": 3.50,
             "wholesale_price": 5.00, "retail_price": 8.00, "gst_percentage": 5.0,
             "prescription_required": True},
            {"product_name": "Metformin 500mg", "generic_name": "Metformin HCl", "brand_name": "Diabend",
             "sku": "MED-MET-500", "manufacturer": "ACI Pharma", "category": MedicineCategory.TABLET,
             "dosage": "500mg", "pack_size": "30 tablets", "purchase_price": 2.00,
             "wholesale_price": 3.50, "retail_price": 6.00, "gst_percentage": 5.0,
             "prescription_required": True},
            {"product_name": "Omeprazole 20mg", "generic_name": "Omeprazole", "brand_name": "Losectil",
             "sku": "MED-OMP-020", "manufacturer": "Incepta Pharma", "category": MedicineCategory.CAPSULE,
             "dosage": "20mg", "pack_size": "14 capsules", "purchase_price": 4.00,
             "wholesale_price": 6.00, "retail_price": 10.00, "gst_percentage": 5.0,
             "prescription_required": True},
            {"product_name": "Cetirizine 10mg", "generic_name": "Cetirizine HCl", "brand_name": "Actin",
             "sku": "MED-CET-010", "manufacturer": "Healthcare Pharma", "category": MedicineCategory.TABLET,
             "dosage": "10mg", "pack_size": "10 tablets/strip", "purchase_price": 1.00,
             "wholesale_price": 1.80, "retail_price": 3.50, "gst_percentage": 5.0},
            {"product_name": "Azithromycin 250mg", "generic_name": "Azithromycin", "brand_name": "Azithro",
             "sku": "MED-AZI-250", "manufacturer": "Beximco Pharma", "category": MedicineCategory.TABLET,
             "dosage": "250mg", "pack_size": "6 tablets", "purchase_price": 15.00,
             "wholesale_price": 22.00, "retail_price": 35.00, "gst_percentage": 5.0,
             "prescription_required": True},
            {"product_name": "Vitamin C 500mg", "generic_name": "Ascorbic Acid", "brand_name": "Cevit",
             "sku": "MED-VTC-500", "manufacturer": "Renata Pharma", "category": MedicineCategory.TABLET,
             "dosage": "500mg", "pack_size": "30 tablets", "purchase_price": 3.00,
             "wholesale_price": 5.00, "retail_price": 8.00, "gst_percentage": 0.0},
            {"product_name": "Salbutamol Inhaler", "generic_name": "Salbutamol", "brand_name": "Sultolin",
             "sku": "MED-SAL-INH", "manufacturer": "Square Pharma", "category": MedicineCategory.INHALER,
             "dosage": "100mcg/dose", "pack_size": "200 doses", "purchase_price": 8.00,
             "wholesale_price": 12.00, "retail_price": 18.00, "gst_percentage": 5.0,
             "prescription_required": True},
            {"product_name": "Insulin Glargine", "generic_name": "Insulin Glargine", "brand_name": "Lantus",
             "sku": "MED-INS-GLG", "manufacturer": "Sanofi", "category": MedicineCategory.INJECTION,
             "dosage": "100 IU/mL", "pack_size": "10mL vial", "purchase_price": 50.00,
             "wholesale_price": 75.00, "retail_price": 120.00, "gst_percentage": 5.0,
             "prescription_required": True,
             "storage_condition": StorageCondition.REFRIGERATED},
            {"product_name": "Atorvastatin 20mg", "generic_name": "Atorvastatin", "brand_name": "Lipistat",
             "sku": "MED-ATO-020", "manufacturer": "Aristopharma", "category": MedicineCategory.TABLET,
             "dosage": "20mg", "pack_size": "30 tablets", "purchase_price": 5.00,
             "wholesale_price": 8.00, "retail_price": 14.00, "gst_percentage": 5.0,
             "prescription_required": True},
            {"product_name": "Amlodin 5mg", "generic_name": "Amlodipine", "brand_name": "Amlodin",
             "sku": "MED-AML-005", "manufacturer": "Eskayef Pharma", "category": MedicineCategory.TABLET,
             "dosage": "5mg", "pack_size": "30 tablets", "purchase_price": 3.00,
             "wholesale_price": 5.00, "retail_price": 9.00, "gst_percentage": 5.0,
             "prescription_required": True},
            {"product_name": "Cough Syrup Benadryl", "generic_name": "Diphenhydramine HCl", "brand_name": "Benadryl",
             "sku": "MED-BEN-SYR", "manufacturer": "Pfizer", "category": MedicineCategory.SYRUP,
             "dosage": "12.5mg/5ml", "pack_size": "100ml bottle", "purchase_price": 4.00,
             "wholesale_price": 6.50, "retail_price": 10.00, "gst_percentage": 5.0},
            {"product_name": "Diclofenac 50mg", "generic_name": "Diclofenac Sodium", "brand_name": "Voveran",
             "sku": "MED-DCL-050", "manufacturer": "Novartis", "category": MedicineCategory.TABLET,
             "dosage": "50mg", "pack_size": "10 tablets/strip", "purchase_price": 2.00,
             "wholesale_price": 3.50, "retail_price": 6.00, "gst_percentage": 5.0,
             "prescription_required": True},
            {"product_name": "Ranitidine 150mg", "generic_name": "Ranitidine HCl", "brand_name": "Zinetac",
             "sku": "MED-RAN-150", "manufacturer": "GSK", "category": MedicineCategory.TABLET,
             "dosage": "150mg", "pack_size": "10 tablets/strip", "purchase_price": 1.50,
             "wholesale_price": 2.50, "retail_price": 4.50, "gst_percentage": 5.0,
             "prescription_required": True},
            {"product_name": "Losartan 50mg", "generic_name": "Losartan Potassium", "brand_name": "Cozaar",
             "sku": "MED-LOS-050", "manufacturer": "MSD", "category": MedicineCategory.TABLET,
             "dosage": "50mg", "pack_size": "30 tablets", "purchase_price": 8.00,
             "wholesale_price": 13.00, "retail_price": 22.00, "gst_percentage": 5.0,
             "prescription_required": True},
        ]

        created_medicines = []
        for med_data in medicines_data:
            med = Medicine(
                supplier_id=supplier.id,
                is_active=True,
                is_approved=True,
                **med_data
            )
            db.add(med)
            db.flush()
            created_medicines.append(med)

            # Create inventory
            qty = random.randint(50, 500)
            inv = Inventory(
                medicine_id=med.id,
                total_quantity=qty,
                reorder_level=random.randint(10, 30),
                max_stock_level=1000
            )
            db.add(inv)

            # Create batch
            batch = InventoryBatch(
                medicine_id=med.id,
                supplier_id=supplier.id,
                batch_number=f"BATCH-{med.sku}-001",
                expiry_date=date.today() + timedelta(days=random.randint(180, 730)),
                manufacturing_date=date.today() - timedelta(days=random.randint(30, 180)),
                quantity_received=qty,
                quantity_available=qty,
                purchase_price=med_data.get("purchase_price"),
                status="active"
            )
            db.add(batch)

        db.commit()
        print(f"[seed_v2] Created {len(medicines_data)} medicines, users, and profiles.")

    except Exception as e:
        print(f"[seed_v2] Error: {e}")
        db.rollback()
    finally:
        db.close()
