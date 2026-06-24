-- Migration 004: Add customer_name and customer_email columns to orders table

ALTER TABLE orders ADD COLUMN customer_name TEXT;
ALTER TABLE orders ADD COLUMN customer_email TEXT;
