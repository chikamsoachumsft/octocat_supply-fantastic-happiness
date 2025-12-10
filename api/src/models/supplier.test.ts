import { describe, it, expect } from 'vitest';
import { Supplier } from './supplier';

describe('Supplier Model', () => {
  it('should create a valid supplier object', () => {
    const supplier: Supplier = {
      supplierId: 1,
      name: 'PurrTech Innovations',
      description: 'Leading supplier of premium smart cat technology',
      contactPerson: 'Felix Whiskerton',
      email: 'felix@purrtech.co',
      phone: '555-0101',
      active: true,
      verified: true,
    };

    expect(supplier.supplierId).toBe(1);
    expect(supplier.name).toBe('PurrTech Innovations');
    expect(supplier.description).toBe('Leading supplier of premium smart cat technology');
    expect(supplier.contactPerson).toBe('Felix Whiskerton');
    expect(supplier.email).toBe('felix@purrtech.co');
    expect(supplier.phone).toBe('555-0101');
    expect(supplier.active).toBe(true);
    expect(supplier.verified).toBe(true);
  });

  it('should support boolean active and verified fields', () => {
    const activeSupplier: Supplier = {
      supplierId: 2,
      name: 'Active Supplier',
      description: 'Test',
      contactPerson: 'Test',
      email: 'test@test.com',
      phone: '555-0000',
      active: true,
      verified: false,
    };

    const inactiveSupplier: Supplier = {
      supplierId: 3,
      name: 'Inactive Supplier',
      description: 'Test',
      contactPerson: 'Test',
      email: 'test2@test.com',
      phone: '555-0001',
      active: false,
      verified: false,
    };

    expect(activeSupplier.active).toBe(true);
    expect(activeSupplier.verified).toBe(false);
    expect(inactiveSupplier.active).toBe(false);
    expect(inactiveSupplier.verified).toBe(false);
  });

  it('should have all required properties', () => {
    const supplier: Supplier = {
      supplierId: 1,
      name: 'Test Supplier',
      description: 'Test',
      contactPerson: 'Test Person',
      email: 'test@test.com',
      phone: '555-0000',
      active: true,
      verified: true,
    };

    expect(supplier).toHaveProperty('supplierId');
    expect(supplier).toHaveProperty('name');
    expect(supplier).toHaveProperty('description');
    expect(supplier).toHaveProperty('contactPerson');
    expect(supplier).toHaveProperty('email');
    expect(supplier).toHaveProperty('phone');
    expect(supplier).toHaveProperty('active');
    expect(supplier).toHaveProperty('verified');
  });

  it('should validate property types', () => {
    const supplier: Supplier = {
      supplierId: 1,
      name: 'Type Test Supplier',
      description: 'Testing types',
      contactPerson: 'Type Tester',
      email: 'type@test.com',
      phone: '555-0100',
      active: true,
      verified: false,
    };

    expect(typeof supplier.supplierId).toBe('number');
    expect(typeof supplier.name).toBe('string');
    expect(typeof supplier.description).toBe('string');
    expect(typeof supplier.contactPerson).toBe('string');
    expect(typeof supplier.email).toBe('string');
    expect(typeof supplier.phone).toBe('string');
    expect(typeof supplier.active).toBe('boolean');
    expect(typeof supplier.verified).toBe('boolean');
  });
});
