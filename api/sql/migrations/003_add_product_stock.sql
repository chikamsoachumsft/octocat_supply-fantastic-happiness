-- Migration 003: Add stock_level column to products table

ALTER TABLE products ADD COLUMN stock_level INTEGER NOT NULL DEFAULT 0;
