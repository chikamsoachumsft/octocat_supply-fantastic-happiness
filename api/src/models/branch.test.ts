import { describe, it, expect } from 'vitest';
import type { Branch } from './branch';

describe('Branch Model', () => {
  it('should accept a valid branch object', () => {
    const branch: Branch = {
      branchId: 1,
      headquartersId: 1,
      name: 'Test Branch',
      description: 'Test branch description',
      address: '123 Branch St',
      contactPerson: 'John Doe',
      email: 'john@branch.com',
      phone: '555-1234',
    };

    expect(branch.branchId).toBe(1);
    expect(branch.headquartersId).toBe(1);
    expect(branch.name).toBe('Test Branch');
    expect(branch.description).toBe('Test branch description');
    expect(branch.address).toBe('123 Branch St');
    expect(branch.contactPerson).toBe('John Doe');
    expect(branch.email).toBe('john@branch.com');
    expect(branch.phone).toBe('555-1234');
  });

  it('should accept branches from different headquarters', () => {
    const branch1: Branch = {
      branchId: 1,
      headquartersId: 1,
      name: 'HQ1 Branch',
      description: 'Branch 1',
      address: 'Address 1',
      contactPerson: 'Person 1',
      email: 'branch1@test.com',
      phone: '555-0001',
    };

    const branch2: Branch = {
      branchId: 2,
      headquartersId: 2,
      name: 'HQ2 Branch',
      description: 'Branch 2',
      address: 'Address 2',
      contactPerson: 'Person 2',
      email: 'branch2@test.com',
      phone: '555-0002',
    };

    expect(branch1.headquartersId).toBe(1);
    expect(branch2.headquartersId).toBe(2);
  });

  it('should have all required fields', () => {
    const branch: Branch = {
      branchId: 3,
      headquartersId: 1,
      name: 'Required Branch',
      description: 'Description',
      address: 'Address',
      contactPerson: 'Contact',
      email: 'email@test.com',
      phone: '555-0000',
    };

    expect(branch.branchId).toBeDefined();
    expect(branch.headquartersId).toBeDefined();
    expect(branch.name).toBeDefined();
    expect(branch.description).toBeDefined();
    expect(branch.address).toBeDefined();
    expect(branch.contactPerson).toBeDefined();
    expect(branch.email).toBeDefined();
    expect(branch.phone).toBeDefined();
  });
});
