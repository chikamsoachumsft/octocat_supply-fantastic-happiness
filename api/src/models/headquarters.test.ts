import { describe, it, expect } from 'vitest';
import type { Headquarters } from './headquarters';

describe('Headquarters Model', () => {
  it('should accept a valid headquarters object', () => {
    const headquarters: Headquarters = {
      headquartersId: 1,
      name: 'Main HQ',
      description: 'Main headquarters building',
      address: '123 Main St',
      contactPerson: 'Alice Johnson',
      email: 'alice@hq.com',
      phone: '555-0100',
      city: 'New York',
      country: 'USA',
      floorCount: 10,
      capacity: 500,
    };

    expect(headquarters.headquartersId).toBe(1);
    expect(headquarters.name).toBe('Main HQ');
    expect(headquarters.description).toBe('Main headquarters building');
    expect(headquarters.address).toBe('123 Main St');
    expect(headquarters.contactPerson).toBe('Alice Johnson');
    expect(headquarters.email).toBe('alice@hq.com');
    expect(headquarters.phone).toBe('555-0100');
    expect(headquarters.city).toBe('New York');
    expect(headquarters.country).toBe('USA');
    expect(headquarters.floorCount).toBe(10);
    expect(headquarters.capacity).toBe(500);
  });

  it('should accept headquarters without optional fields', () => {
    const headquarters: Headquarters = {
      headquartersId: 2,
      name: 'Branch HQ',
      description: 'Branch office',
      address: '456 Branch Ave',
      contactPerson: 'Bob Smith',
      email: 'bob@hq.com',
      phone: '555-0200',
    };

    expect(headquarters.city).toBeUndefined();
    expect(headquarters.country).toBeUndefined();
    expect(headquarters.floorCount).toBeUndefined();
    expect(headquarters.capacity).toBeUndefined();
  });

  it('should have all required fields', () => {
    const headquarters: Headquarters = {
      headquartersId: 3,
      name: 'Required HQ',
      description: 'Description',
      address: 'Address',
      contactPerson: 'Contact',
      email: 'email@test.com',
      phone: '555-0000',
    };

    expect(headquarters.headquartersId).toBeDefined();
    expect(headquarters.name).toBeDefined();
    expect(headquarters.description).toBeDefined();
    expect(headquarters.address).toBeDefined();
    expect(headquarters.contactPerson).toBeDefined();
    expect(headquarters.email).toBeDefined();
    expect(headquarters.phone).toBeDefined();
  });
});
