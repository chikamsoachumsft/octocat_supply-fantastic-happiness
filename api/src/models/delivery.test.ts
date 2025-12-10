import { describe, it, expect } from 'vitest';
import { Delivery } from './delivery';

describe('Delivery Model', () => {
  it('should create a valid delivery object', () => {
    const delivery: Delivery = {
      deliveryId: 1,
      supplierId: 1,
      deliveryDate: '2024-01-20',
      name: 'Q1 Shipment',
      description: 'Quarterly delivery of cat products',
      status: 'pending',
    };

    expect(delivery.deliveryId).toBe(1);
    expect(delivery.supplierId).toBe(1);
    expect(delivery.deliveryDate).toBe('2024-01-20');
    expect(delivery.name).toBe('Q1 Shipment');
    expect(delivery.description).toBe('Quarterly delivery of cat products');
    expect(delivery.status).toBe('pending');
  });

  it('should support different status values', () => {
    const pendingDelivery: Delivery = {
      deliveryId: 1,
      supplierId: 1,
      deliveryDate: '2024-01-20',
      name: 'Pending Delivery',
      description: 'Test',
      status: 'pending',
    };

    const deliveredDelivery: Delivery = {
      deliveryId: 2,
      supplierId: 1,
      deliveryDate: '2024-01-21',
      name: 'Delivered',
      description: 'Test',
      status: 'delivered',
    };

    expect(pendingDelivery.status).toBe('pending');
    expect(deliveredDelivery.status).toBe('delivered');
  });

  it('should have all required properties', () => {
    const delivery: Delivery = {
      deliveryId: 1,
      supplierId: 1,
      deliveryDate: '2024-01-20',
      name: 'Test Delivery',
      description: 'Test',
      status: 'pending',
    };

    expect(delivery).toHaveProperty('deliveryId');
    expect(delivery).toHaveProperty('supplierId');
    expect(delivery).toHaveProperty('deliveryDate');
    expect(delivery).toHaveProperty('name');
    expect(delivery).toHaveProperty('description');
    expect(delivery).toHaveProperty('status');
  });

  it('should validate property types', () => {
    const delivery: Delivery = {
      deliveryId: 1,
      supplierId: 1,
      deliveryDate: '2024-01-20',
      name: 'Type Test Delivery',
      description: 'Testing types',
      status: 'in_transit',
    };

    expect(typeof delivery.deliveryId).toBe('number');
    expect(typeof delivery.supplierId).toBe('number');
    expect(typeof delivery.deliveryDate).toBe('string');
    expect(typeof delivery.name).toBe('string');
    expect(typeof delivery.description).toBe('string');
    expect(typeof delivery.status).toBe('string');
  });
});
