-- =========================================================
-- ByteStore - Script de inicialización de Base de Datos
-- PostgreSQL
-- =========================================================
-- =========================================================
-- TABLA: users
-- Almacena tanto a CLIENTE como ADMIN. El rol se valida
-- a nivel DB (CHECK) y luego se replica en el JWT.
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'user'
                        CHECK (role IN ('user', 'admin')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- TABLA: categories
-- Clasifica los productos del catálogo (ej: Celulares,
-- Accesorios, Tablets, etc).
-- =========================================================
CREATE TABLE IF NOT EXISTS categories (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(80) NOT NULL UNIQUE,
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- TABLA: products
-- Catálogo general de productos. El stock se descuenta
-- ÚNICAMENTE en el momento del checkout (regla de negocio
-- crítica). category_id permite filtrar/organizar el catálogo.
-- =========================================================
CREATE TABLE IF NOT EXISTS products (
    id              SERIAL PRIMARY KEY,
    category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    brand           VARCHAR(80)  NOT NULL,
    model           VARCHAR(120) NOT NULL,
    description     TEXT,
    price           NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url       VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- TABLA: cart_items
-- Carrito por usuario. Es TRANSITORIA: se vacía automática-
-- mente cuando el usuario completa una compra exitosa.
-- No descuenta stock por sí sola.
-- =========================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- =========================================================
-- TABLA: orders
-- Cabecera de la orden de compra. Se genera en el momento
-- exacto del checkout, una vez validado el stock.
-- =========================================================
CREATE TABLE IF NOT EXISTS orders (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total_amount    NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status          VARCHAR(20) NOT NULL DEFAULT 'COMPLETED'
                        CHECK (status IN ('COMPLETED', 'CANCELLED')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- TABLA: order_items
-- Detalle inmutable de cada orden. Guarda el precio unitario
-- AL MOMENTO de la compra (no referenciamos products.price
-- directamente, porque ese precio puede cambiar después).
-- ========================================