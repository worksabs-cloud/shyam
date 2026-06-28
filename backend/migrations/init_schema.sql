-- Nahid Pharmacy Distribution Platform - Initial Schema
-- All new tables use _v2 suffix to coexist with legacy schema

-- Users
CREATE TABLE IF NOT EXISTS users_v2 (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    is_verified BOOLEAN DEFAULT FALSE,
    profile_image VARCHAR(500),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Bangladesh',
    last_login TIMESTAMP,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_v2_email ON users_v2(email);
CREATE INDEX IF NOT EXISTS idx_users_v2_role ON users_v2(role);

-- Medicines catalog
CREATE TABLE IF NOT EXISTS medicines_v2 (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    manufacturer VARCHAR(255),
    description TEXT,
    unit_of_measure VARCHAR(50) DEFAULT 'tablet',
    retail_price NUMERIC(12,2) DEFAULT 0,
    wholesale_price NUMERIC(12,2) DEFAULT 0,
    mrp NUMERIC(12,2) DEFAULT 0,
    tax_rate NUMERIC(5,2) DEFAULT 0,
    requires_prescription BOOLEAN DEFAULT FALSE,
    storage_condition VARCHAR(100),
    min_order_quantity INTEGER DEFAULT 1,
    reorder_level INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    supplier_id INTEGER REFERENCES users_v2(id),
    image_url VARCHAR(500),
    barcode VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medicines_v2_sku ON medicines_v2(sku);
CREATE INDEX IF NOT EXISTS idx_medicines_v2_category ON medicines_v2(category);

-- Pharmacies
CREATE TABLE IF NOT EXISTS pharmacies_v2 (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users_v2(id),
    pharmacy_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(20),
    is_approved BOOLEAN DEFAULT FALSE,
    credit_limit NUMERIC(12,2) DEFAULT 0,
    current_balance NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers_v2 (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users_v2(id),
    company_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(20),
    is_approved BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE IF NOT EXISTS customers_v2 (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users_v2(id),
    date_of_birth DATE,
    gender VARCHAR(20),
    loyalty_points INTEGER DEFAULT 0,
    total_spent NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery agents
CREATE TABLE IF NOT EXISTS delivery_agents_v2 (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users_v2(id),
    vehicle_type VARCHAR(50),
    vehicle_number VARCHAR(50),
    is_available BOOLEAN DEFAULT TRUE,
    current_location TEXT,
    total_deliveries INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory batches
CREATE TABLE IF NOT EXISTS inventory_batches_v2 (
    id SERIAL PRIMARY KEY,
    medicine_id INTEGER NOT NULL REFERENCES medicines_v2(id),
    batch_number VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    expiry_date DATE,
    manufacture_date DATE,
    purchase_price NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    supplier_id INTEGER REFERENCES users_v2(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_batches_v2_medicine ON inventory_batches_v2(medicine_id);
CREATE INDEX IF NOT EXISTS idx_batches_v2_expiry ON inventory_batches_v2(expiry_date);

-- Inventory (aggregate)
CREATE TABLE IF NOT EXISTS inventory_v2 (
    id SERIAL PRIMARY KEY,
    medicine_id INTEGER UNIQUE NOT NULL REFERENCES medicines_v2(id),
    total_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders_v2 (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES users_v2(id),
    pharmacy_id INTEGER REFERENCES pharmacies_v2(id),
    order_type VARCHAR(20) NOT NULL DEFAULT 'b2c',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    subtotal NUMERIC(12,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    delivery_fee NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0,
    delivery_address TEXT,
    notes TEXT,
    assigned_agent_id INTEGER REFERENCES delivery_agents_v2(id),
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_v2_customer ON orders_v2(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_v2_status ON orders_v2(status);
CREATE INDEX IF NOT EXISTS idx_orders_v2_created ON orders_v2(created_at);

-- Order items
CREATE TABLE IF NOT EXISTS order_items_v2 (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders_v2(id),
    medicine_id INTEGER NOT NULL REFERENCES medicines_v2(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    batch_id INTEGER REFERENCES inventory_batches_v2(id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments_v2 (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders_v2(id),
    amount NUMERIC(12,2) NOT NULL,
    method VARCHAR(50) DEFAULT 'cash',
    status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications_v2 (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users_v2(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_v2_user ON notifications_v2(user_id);
