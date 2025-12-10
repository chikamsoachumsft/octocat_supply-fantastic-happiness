import { describe, it, expect } from 'vitest';
import type { Supplier } from './supplier';

describe('Supplier Model', () => {
  it('should accept a valid supplier object', () => {
    const supplier: Supplier = {
      supplierId: 1,
      name: 'Test Supplier',
      description: 'Test supplier description',
      contactPerson: 'John Doe',
      email: 'john@supplier.com',
      phone: '555-1234',
      active: true,
      verified: false,
    };

    expect(supplier.supplierId).toBe(1);
    expect(supplier.name).toBe('Test Supplier');
    expect(supplier.description).toBe('Test supplier description');
    expect(supplier.contactPerson).toBe('John Doe');
    expect(supplier.email).toBe('john@supplier.com');
    expect(supplier.phone).toBe('555-1234');
    expect(supplier.active).toBe(true);
    expect(supplier.verified).toBe(false);
  });

  it('should accept an active and verified supplier', () => {
    const supplier: Supplier = {
      supplierId: 2,
      name: 'Active Supplier',
      description: 'Active and verified',
      contactPerson: 'Jane Smith',
      email: 'jane@supplier.com',
      phone: '555-5678',
      active: true,
      verified: true,
    };

    expect(supplier.active).toBe(true);
    expect(supplier.verified).toBe(true);
  });

  it('should have all required fields', () => {
    const supplier: Supplier = {
      supplierId: 3,
      name: 'Required Supplier',
      description: 'Description',
      contactPerson: 'Contact',
      email: 'email@test.com',
      phone: '555-0000',
      active: false,
      verified: false,
    };

    expect(supplier.supplierId).toBeDefined();
    expect(supplier.name).toBeDefined();
    expect(supplier.description).toBeDefined();
    expect(supplier.contactPerson).toBeDefined();
    expect(supplier.email).toBeDefined();
    expect(supplier.phone).toBeDefined();
    expect(supplier.active).toBeDefined();
    expect(supplier.verified).toBeDefined();
  });
});
