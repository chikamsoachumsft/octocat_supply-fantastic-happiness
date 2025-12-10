import { describe, it, expect } from 'vitest';
import { OrderDetailDelivery } from './orderDetailDelivery';

describe('OrderDetailDelivery Model', () => {
  it('should create a valid order detail delivery object', () => {
    const odd: OrderDetailDelivery = {
      orderDetailDeliveryId: 1,
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 5,
      notes: 'First batch delivered',
    };

    expect(odd.orderDetailDeliveryId).toBe(1);
    expect(odd.orderDetailId).toBe(1);
    expect(odd.deliveryId).toBe(1);
    expect(odd.quantity).toBe(5);
    expect(odd.notes).toBe('First batch delivered');
  });

  it('should support different quantity values', () => {
    const smallBatch: OrderDetailDelivery = {
      orderDetailDeliveryId: 1,
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 1,
      notes: 'Small batch',
    };

    const largeBatch: OrderDetailDelivery = {
      orderDetailDeliveryId: 2,
      orderDetailId: 1,
      deliveryId: 2,
      quantity: 50,
      notes: 'Large batch',
    };

    expect(smallBatch.quantity).toBe(1);
    expect(largeBatch.quantity).toBe(50);
  });

  it('should have all required properties', () => {
    const odd: OrderDetailDelivery = {
      orderDetailDeliveryId: 1,
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 10,
      notes: 'Test',
    };

    expect(odd).toHaveProperty('orderDetailDeliveryId');
    expect(odd).toHaveProperty('orderDetailId');
    expect(odd).toHaveProperty('deliveryId');
    expect(odd).toHaveProperty('quantity');
    expect(odd).toHaveProperty('notes');
  });

  it('should validate property types', () => {
    const odd: OrderDetailDelivery = {
      orderDetailDeliveryId: 1,
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 8,
      notes: 'Type test',
    };

    expect(typeof odd.orderDetailDeliveryId).toBe('number');
    expect(typeof odd.orderDetailId).toBe('number');
    expect(typeof odd.deliveryId).toBe('number');
    expect(typeof odd.quantity).toBe('number');
    expect(typeof odd.notes).toBe('string');
  });
});
