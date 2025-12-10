import { describe, it, expect } from 'vitest';
import {
  SelectQueryBuilder,
  toSnakeCase,
  toCamelCase,
  objectToSnakeCase,
  objectToCamelCase,
  generatePlaceholders,
  buildInsertSQL,
  buildUpdateSQL,
  validateRequiredFields,
  mapDatabaseRows,
} from './sql';

describe('SQL Utils', () => {
  describe('SelectQueryBuilder', () => {
    it('should build a simple SELECT query', () => {
      const builder = new SelectQueryBuilder('products');
      const sql = builder.build();
      expect(sql).toBe('SELECT * FROM products');
    });

    it('should build a SELECT query with specific columns', () => {
      const builder = new SelectQueryBuilder('products');
      const sql = builder.select(['id', 'name', 'price']).build();
      expect(sql).toBe('SELECT id, name, price FROM products');
    });

    it('should build a SELECT query with WHERE clause', () => {
      const builder = new SelectQueryBuilder('products');
      const sql = builder.where('price > 100').build();
      expect(sql).toBe('SELECT * FROM products WHERE price > 100');
    });

    it('should build a SELECT query with multiple WHERE clauses', () => {
      const builder = new SelectQueryBuilder('products');
      const sql = builder.where('price > 100').where('active = 1').build();
      expect(sql).toBe('SELECT * FROM products WHERE price > 100 AND active = 1');
    });

    it('should build a SELECT query with ORDER BY', () => {
      const builder = new SelectQueryBuilder('products');
      const sql = builder.orderBy('name').build();
      expect(sql).toBe('SELECT * FROM products ORDER BY name ASC');
    });

    it('should build a SELECT query with ORDER BY DESC', () => {
      const builder = new SelectQueryBuilder('products');
      const sql = builder.orderBy('price', 'DESC').build();
      expect(sql).toBe('SELECT * FROM products ORDER BY price DESC');
    });

    it('should build a SELECT query with LIMIT', () => {
      const builder = new SelectQueryBuilder('products');
      const sql = builder.limit(10).build();
      expect(sql).toBe('SELECT * FROM products LIMIT 10');
    });

    it('should build a SELECT query with OFFSET', () => {
      const builder = new SelectQueryBuilder('products');
      const sql = builder.offset(20).build();
      expect(sql).toBe('SELECT * FROM products OFFSET 20');
    });

    it('should build a SELECT query with LIMIT and OFFSET', () => {
      const builder = new SelectQueryBuilder('products');
      const sql = builder.limit(10).offset(20).build();
      expect(sql).toBe('SELECT * FROM products LIMIT 10 OFFSET 20');
    });

    it('should build a SELECT query with JOIN', () => {
      const builder = new SelectQueryBuilder('products');
      const sql = builder.join('suppliers', 'products.supplier_id = suppliers.id').build();
      expect(sql).toBe('SELECT * FROM products INNER JOIN suppliers ON products.supplier_id = suppliers.id');
    });

    it('should build a SELECT query with LEFT JOIN', () => {
      const builder = new SelectQueryBuilder('products');
      const sql = builder.join('suppliers', 'products.supplier_id = suppliers.id', 'LEFT').build();
      expect(sql).toBe('SELECT * FROM products LEFT JOIN suppliers ON products.supplier_id = suppliers.id');
    });

    it('should build a complex SELECT query', () => {
      const builder = new SelectQueryBuilder('products');
      const sql = builder
        .select(['id', 'name', 'price'])
        .join('suppliers', 'products.supplier_id = suppliers.id')
        .where('price > 100')
        .where('active = 1')
        .orderBy('name')
        .limit(10)
        .offset(5)
        .build();
      expect(sql).toBe(
        'SELECT id, name, price FROM products INNER JOIN suppliers ON products.supplier_id = suppliers.id WHERE price > 100 AND active = 1 ORDER BY name ASC LIMIT 10 OFFSET 5'
      );
    });
  });

  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('camelCase')).toBe('camel_case');
      expect(toSnakeCase('productId')).toBe('product_id');
      expect(toSnakeCase('supplierId')).toBe('supplier_id');
    });

    it('should handle already snake_case strings', () => {
      expect(toSnakeCase('already_snake_case')).toBe('already_snake_case');
    });

    it('should handle single words', () => {
      expect(toSnakeCase('single')).toBe('single');
    });
  });

  describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase('snake_case')).toBe('snakeCase');
      expect(toCamelCase('product_id')).toBe('productId');
      expect(toCamelCase('supplier_id')).toBe('supplierId');
    });

    it('should handle already camelCase strings', () => {
      expect(toCamelCase('alreadyCamelCase')).toBe('alreadyCamelCase');
    });

    it('should handle single words', () => {
      expect(toCamelCase('single')).toBe('single');
    });
  });

  describe('objectToSnakeCase', () => {
    it('should convert object keys from camelCase to snake_case', () => {
      const input = {
        productId: 1,
        supplierId: 2,
        unitPrice: 10.99,
      };
      const output = objectToSnakeCase(input);
      expect(output).toEqual({
        product_id: 1,
        supplier_id: 2,
        unit_price: 10.99,
      });
    });

    it('should convert boolean values to integers', () => {
      const input = {
        active: true,
        verified: false,
      };
      const output = objectToSnakeCase(input);
      expect(output).toEqual({
        active: true, // Note: conversion happens in buildInsertSQL/buildUpdateSQL
        verified: false,
      });
    });
  });

  describe('objectToCamelCase', () => {
    it('should convert object keys from snake_case to camelCase', () => {
      const input = {
        product_id: 1,
        supplier_id: 2,
        unit_price: 10.99,
      };
      const output = objectToCamelCase(input);
      expect(output).toEqual({
        productId: 1,
        supplierId: 2,
        unitPrice: 10.99,
      });
    });
  });

  describe('mapDatabaseRows', () => {
    it('should convert multiple database rows to typed models', () => {
      const rows = [
        { product_id: 1, product_name: 'Product 1', unit_price: 10.99 },
        { product_id: 2, product_name: 'Product 2', unit_price: 20.99 },
      ];
      const mapped = mapDatabaseRows(rows);
      expect(mapped).toEqual([
        { productId: 1, productName: 'Product 1', unitPrice: 10.99 },
        { productId: 2, productName: 'Product 2', unitPrice: 20.99 },
      ]);
    });

    it('should handle empty array', () => {
      const rows: any[] = [];
      const mapped = mapDatabaseRows(rows);
      expect(mapped).toEqual([]);
    });
  });

  describe('generatePlaceholders', () => {
    it('should generate correct number of placeholders', () => {
      expect(generatePlaceholders(1)).toBe('?');
      expect(generatePlaceholders(3)).toBe('?, ?, ?');
      expect(generatePlaceholders(5)).toBe('?, ?, ?, ?, ?');
    });

    it('should handle zero placeholders', () => {
      expect(generatePlaceholders(0)).toBe('');
    });
  });

  describe('buildInsertSQL', () => {
    it('should build correct INSERT SQL with values', () => {
      const data = {
        name: 'Test Product',
        price: 99.99,
        supplierId: 1,
      };
      const { sql, values } = buildInsertSQL('products', data);
      
      expect(sql).toBe('INSERT INTO products (name, price, supplier_id) VALUES (?, ?, ?)');
      expect(values).toEqual(['Test Product', 99.99, 1]);
    });

    it('should convert boolean values to integers', () => {
      const data = {
        active: true,
        verified: false,
      };
      const { sql, values } = buildInsertSQL('suppliers', data);
      
      expect(values).toEqual([1, 0]); // true becomes 1, false becomes 0
    });
  });

  describe('buildUpdateSQL', () => {
    it('should build correct UPDATE SQL with WHERE clause', () => {
      const data = {
        name: 'Updated Name',
        price: 79.99,
      };
      const { sql, values } = buildUpdateSQL('products', data, 'product_id = ?');
      
      expect(sql).toBe('UPDATE products SET name = ?, price = ? WHERE product_id = ?');
      expect(values).toEqual(['Updated Name', 79.99]);
    });

    it('should convert boolean values to integers in updates', () => {
      const data = {
        active: false,
        verified: true,
      };
      const { sql, values } = buildUpdateSQL('suppliers', data, 'supplier_id = ?');
      
      expect(values).toEqual([0, 1]); // false becomes 0, true becomes 1
    });

    it('should handle partial updates', () => {
      const data = {
        name: 'New Name',
      };
      const { sql, values } = buildUpdateSQL('products', data, 'product_id = ?');
      
      expect(sql).toBe('UPDATE products SET name = ? WHERE product_id = ?');
      expect(values).toEqual(['New Name']);
    });
  });

  describe('validateRequiredFields', () => {
    it('should not throw for objects with all required fields', () => {
      const obj = {
        name: 'Test',
        price: 99.99,
        supplierId: 1,
      };
      expect(() => validateRequiredFields(obj, ['name', 'price', 'supplierId'])).not.toThrow();
    });

    it('should throw for missing fields', () => {
      const obj = {
        name: 'Test',
      };
      expect(() => validateRequiredFields(obj, ['name', 'price'])).toThrow("Required field 'price' is missing or empty");
    });

    it('should throw for null fields', () => {
      const obj = {
        name: null,
      };
      expect(() => validateRequiredFields(obj, ['name'])).toThrow("Required field 'name' is missing or empty");
    });

    it('should throw for empty string fields', () => {
      const obj = {
        name: '',
      };
      expect(() => validateRequiredFields(obj, ['name'])).toThrow("Required field 'name' is missing or empty");
    });
  });
});
