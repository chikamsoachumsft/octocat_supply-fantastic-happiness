-- Migration: Add stock tracking and guest checkout support
-- Date: 2026-02-25
-- Description: Adds stock_level to products table and customer fields to orders table

-- Add stock_level column to products table
ALTER TABLE products ADD COLUMN stock_level INTEGER NOT NULL DEFAULT 0;

-- Add index on stock_level for filtering low-stock products
CREATE INDEX idx_products_stock_level ON products(stock_level);

-- Add customer fields to orders table for guest checkout
ALTER TABLE orders ADD COLUMN customer_name TEXT;
ALTER TABLE orders ADD COLUMN customer_email TEXT;

-- Add index on customer_email for order lookups
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
