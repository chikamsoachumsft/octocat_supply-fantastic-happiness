import { describe, it, expect } from 'vitest';
import { Product } from './product';

describe('Product Model', () => {
  it('should create a valid product object', () => {
    const product: Product = {
      productId: 1,
      supplierId: 1,
      name: 'SmartFeeder Pro',
      description: 'Advanced automatic cat feeder',
      price: 129.99,
      sku: 'SF-PRO-001',
      unit: 'each',
      imgName: 'smartfeeder-pro.jpg',
      discount: 0.1,
    };

    expect(product.productId).toBe(1);
    expect(product.supplierId).toBe(1);
    expect(product.name).toBe('SmartFeeder Pro');
    expect(product.description).toBe('Advanced automatic cat feeder');
    expect(product.price).toBe(129.99);
    expect(product.sku).toBe('SF-PRO-001');
    expect(product.unit).toBe('each');
    expect(product.imgName).toBe('smartfeeder-pro.jpg');
    expect(product.discount).toBe(0.1);
  });

  it('should support optional discount field', () => {
    const productWithoutDiscount: Product = {
      productId: 2,
      supplierId: 1,
      name: 'Basic Product',
      description: 'No discount',
      price: 49.99,
      sku: 'BASIC-001',
      unit: 'each',
      imgName: 'basic.jpg',
    };

    expect(productWithoutDiscount.discount).toBeUndefined();
  });

  it('should have all required properties', () => {
    const product: Product = {
      productId: 1,
      supplierId: 1,
      name: 'Test Product',
      description: 'Test',
      price: 10.0,
      sku: 'TEST-001',
      unit: 'each',
      imgName: 'test.jpg',
    };

    expect(product).toHaveProperty('productId');
    expect(product).toHaveProperty('supplierId');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('description');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('sku');
    expect(product).toHaveProperty('unit');
    expect(product).toHaveProperty('imgName');
  });

  it('should validate property types', () => {
    const product: Product = {
      productId: 1,
      supplierId: 1,
      name: 'Type Test Product',
      description: 'Testing types',
      price: 99.99,
      sku: 'TYPE-001',
      unit: 'each',
      imgName: 'type.jpg',
      discount: 0.15,
    };

    expect(typeof product.productId).toBe('number');
    expect(typeof product.supplierId).toBe('number');
    expect(typeof product.name).toBe('string');
    expect(typeof product.description).toBe('string');
    expect(typeof product.price).toBe('number');
    expect(typeof product.sku).toBe('string');
    expect(typeof product.unit).toBe('string');
    expect(typeof product.imgName).toBe('string');
    expect(typeof product.discount).toBe('number');
  });
});
