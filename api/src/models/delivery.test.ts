import { describe, it, expect } from 'vitest';
import type { Delivery } from './delivery';

describe('Delivery Model', () => {
  it('should accept a valid delivery object', () => {
    const delivery: Delivery = {
      deliveryId: 1,
      supplierId: 1,
      deliveryDate: '2024-01-20',
      name: 'Test Delivery',
      description: 'Test delivery description',
      status: 'pending',
    };

    expect(delivery.deliveryId).toBe(1);
    expect(delivery.supplierId).toBe(1);
    expect(delivery.deliveryDate).toBe('2024-01-20');
    expect(delivery.name).toBe('Test Delivery');
    expect(delivery.description).toBe('Test delivery description');
    expect(delivery.status).toBe('pending');
  });

  it('should accept different delivery statuses', () => {
    const statuses = ['pending', 'in-transit', 'delivered', 'failed'];

    statuses.forEach((status, index) => {
      const delivery: Delivery = {
        deliveryId: index + 1,
        supplierId: 1,
        deliveryDate: '2024-01-20',
        name: `Delivery ${index + 1}`,
        description: 'Test',
        status,
      };

      expect(delivery.status).toBe(status);
    });
  });

  it('should have all required fields', () => {
    const delivery: Delivery = {
      deliveryId: 10,
      supplierId: 5,
      deliveryDate: '2024-01-25',
      name: 'Required Delivery',
      description: 'Description',
      status: 'pending',
    };

    expect(delivery.deliveryId).toBeDefined();
    expect(delivery.supplierId).toBeDefined();
    expect(delivery.deliveryDate).toBeDefined();
    expect(delivery.name).toBeDefined();
    expect(delivery.description).toBeDefined();
    expect(delivery.status).toBeDefined();
  });
});
