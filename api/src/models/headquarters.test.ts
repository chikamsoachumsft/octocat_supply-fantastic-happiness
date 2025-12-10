import { describe, it, expect } from 'vitest';
import { Headquarters } from './headquarters';

describe('Headquarters Model', () => {
  it('should create a valid headquarters object', () => {
    const hq: Headquarters = {
      headquartersId: 1,
      name: 'CatTech Global HQ',
      description: 'Feline tech innovations headquarters',
      address: '123 Whisker Lane, Purrington District',
      contactPerson: 'Catherine Purrston',
      email: 'catherine@octocat.com',
      phone: '555-0001',
    };

    expect(hq.headquartersId).toBe(1);
    expect(hq.name).toBe('CatTech Global HQ');
    expect(hq.description).toBe('Feline tech innovations headquarters');
    expect(hq.address).toBe('123 Whisker Lane, Purrington District');
    expect(hq.contactPerson).toBe('Catherine Purrston');
    expect(hq.email).toBe('catherine@octocat.com');
    expect(hq.phone).toBe('555-0001');
  });

  it('should support optional city, country, floorCount, and capacity fields', () => {
    const hqWithOptional: Headquarters = {
      headquartersId: 2,
      name: 'Test HQ',
      description: 'Test',
      address: '123 Test St',
      contactPerson: 'Test Person',
      email: 'test@test.com',
      phone: '555-0000',
      city: 'TestCity',
      country: 'TestCountry',
      floorCount: 5,
      capacity: 100,
    };

    expect(hqWithOptional.city).toBe('TestCity');
    expect(hqWithOptional.country).toBe('TestCountry');
    expect(hqWithOptional.floorCount).toBe(5);
    expect(hqWithOptional.capacity).toBe(100);

    const hqWithoutOptional: Headquarters = {
      headquartersId: 3,
      name: 'Minimal HQ',
      description: 'Minimal',
      address: '456 Min St',
      contactPerson: 'Min Person',
      email: 'min@test.com',
      phone: '555-0002',
    };

    expect(hqWithoutOptional.city).toBeUndefined();
    expect(hqWithoutOptional.country).toBeUndefined();
    expect(hqWithoutOptional.floorCount).toBeUndefined();
    expect(hqWithoutOptional.capacity).toBeUndefined();
  });

  it('should have all required properties', () => {
    const hq: Headquarters = {
      headquartersId: 1,
      name: 'Test HQ',
      description: 'Test',
      address: '123 Test St',
      contactPerson: 'Test Person',
      email: 'test@test.com',
      phone: '555-0000',
    };

    expect(hq).toHaveProperty('headquartersId');
    expect(hq).toHaveProperty('name');
    expect(hq).toHaveProperty('description');
    expect(hq).toHaveProperty('address');
    expect(hq).toHaveProperty('contactPerson');
    expect(hq).toHaveProperty('email');
    expect(hq).toHaveProperty('phone');
  });

  it('should validate property types', () => {
    const hq: Headquarters = {
      headquartersId: 1,
      name: 'Type Test HQ',
      description: 'Testing types',
      address: '789 Type St',
      contactPerson: 'Type Tester',
      email: 'type@test.com',
      phone: '555-0100',
      city: 'TypeCity',
      country: 'TypeCountry',
      floorCount: 10,
      capacity: 200,
    };

    expect(typeof hq.headquartersId).toBe('number');
    expect(typeof hq.name).toBe('string');
    expect(typeof hq.description).toBe('string');
    expect(typeof hq.address).toBe('string');
    expect(typeof hq.contactPerson).toBe('string');
    expect(typeof hq.email).toBe('string');
    expect(typeof hq.phone).toBe('string');
    expect(typeof hq.city).toBe('string');
    expect(typeof hq.country).toBe('string');
    expect(typeof hq.floorCount).toBe('number');
    expect(typeof hq.capacity).toBe('number');
  });
});
