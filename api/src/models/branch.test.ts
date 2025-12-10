import { describe, it, expect } from 'vitest';
import { Branch } from './branch';

describe('Branch Model', () => {
  it('should create a valid branch object', () => {
    const branch: Branch = {
      branchId: 1,
      headquartersId: 1,
      name: 'Test Branch',
      description: 'Test branch description',
      address: '123 Test St',
      contactPerson: 'John Doe',
      email: 'john@test.com',
      phone: '555-0100',
    };

    expect(branch.branchId).toBe(1);
    expect(branch.headquartersId).toBe(1);
    expect(branch.name).toBe('Test Branch');
    expect(branch.description).toBe('Test branch description');
    expect(branch.address).toBe('123 Test St');
    expect(branch.contactPerson).toBe('John Doe');
    expect(branch.email).toBe('john@test.com');
    expect(branch.phone).toBe('555-0100');
  });

  it('should have all required properties', () => {
    const branch: Branch = {
      branchId: 2,
      headquartersId: 1,
      name: 'Minimal Branch',
      description: '',
      address: '',
      contactPerson: '',
      email: '',
      phone: '',
    };

    expect(branch).toHaveProperty('branchId');
    expect(branch).toHaveProperty('headquartersId');
    expect(branch).toHaveProperty('name');
    expect(branch).toHaveProperty('description');
    expect(branch).toHaveProperty('address');
    expect(branch).toHaveProperty('contactPerson');
    expect(branch).toHaveProperty('email');
    expect(branch).toHaveProperty('phone');
  });

  it('should validate property types', () => {
    const branch: Branch = {
      branchId: 1,
      headquartersId: 1,
      name: 'Type Test Branch',
      description: 'Testing property types',
      address: '456 Type St',
      contactPerson: 'Jane Smith',
      email: 'jane@test.com',
      phone: '555-0200',
    };

    expect(typeof branch.branchId).toBe('number');
    expect(typeof branch.headquartersId).toBe('number');
    expect(typeof branch.name).toBe('string');
    expect(typeof branch.description).toBe('string');
    expect(typeof branch.address).toBe('string');
    expect(typeof branch.contactPerson).toBe('string');
    expect(typeof branch.email).toBe('string');
    expect(typeof branch.phone).toBe('string');
  });
});
