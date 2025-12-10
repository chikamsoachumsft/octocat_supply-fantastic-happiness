import { describe, it, expect } from 'vitest';
import type { Product } from './product';

describe('Product Model', () => {
  it('should accept a valid product object', () => {
    const product: Product = {
      productId: 1,
      supplierId: 1,
      name: 'Test Product',
      description: 'Test description',
      price: 99.99,
      sku: 'SKU-001',
      unit: 'piece',
      imgName: 'test.jpg',
      discount: 0.1,
    };

    expect(product.productId).toBe(1);
    expect(product.supplierId).toBe(1);
    expect(product.name).toBe('Test Product');
    expect(product.description).toBe('Test description');
    expect(product.price).toBe(99.99);
    expect(product.sku).toBe('SKU-001');
    expect(product.unit).toBe('piece');
    expect(product.imgName).toBe('test.jpg');
    expect(product.discount).toBe(0.1);
  });

  it('should accept a product without optional discount', () => {
    const product: Product = {
      productId: 2,
      supplierId: 1,
      name: 'Product Without Discount',
      description: 'No discount product',
      price: 49.99,
      sku: 'SKU-002',
      unit: 'box',
      imgName: 'product.jpg',
    };

    expect(product.discount).toBeUndefined();
  });

  it('should have required fields', () => {
    const product: Product = {
      productId: 3,
      supplierId: 2,
      name: 'Required Fields Product',
      description: 'Test',
      price: 10.00,
      sku: 'SKU-003',
      unit: 'piece',
      imgName: 'img.jpg',
    };

    expect(product.productId).toBeDefined();
    expect(product.supplierId).toBeDefined();
    expect(product.name).toBeDefined();
    expect(product.price).toBeDefined();
    expect(product.sku).toBeDefined();
    expect(product.unit).toBeDefined();
    expect(product.imgName).toBeDefined();
  });
});
