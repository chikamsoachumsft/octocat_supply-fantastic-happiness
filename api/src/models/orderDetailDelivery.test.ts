import { describe, it, expect } from 'vitest';
import type { OrderDetailDelivery } from './orderDetailDelivery';

describe('OrderDetailDelivery Model', () => {
  it('should accept a valid order detail delivery object', () => {
    const orderDetailDelivery: OrderDetailDelivery = {
      orderDetailDeliveryId: 1,
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 3,
      notes: 'Test order detail delivery',
    };

    expect(orderDetailDelivery.orderDetailDeliveryId).toBe(1);
    expect(orderDetailDelivery.orderDetailId).toBe(1);
    expect(orderDetailDelivery.deliveryId).toBe(1);
    expect(orderDetailDelivery.quantity).toBe(3);
    expect(orderDetailDelivery.notes).toBe('Test order detail delivery');
  });

  it('should accept different quantities', () => {
    const orderDetailDelivery: OrderDetailDelivery = {
      orderDetailDeliveryId: 2,
      orderDetailId: 1,
      deliveryId: 2,
      quantity: 50,
      notes: 'Large shipment',
    };

    expect(orderDetailDelivery.quantity).toBe(50);
  });

  it('should have all required fields', () => {
    const orderDetailDelivery: OrderDetailDelivery = {
      orderDetailDeliveryId: 3,
      orderDetailId: 2,
      deliveryId: 3,
      quantity: 1,
      notes: 'Single delivery',
    };

    expect(orderDetailDelivery.orderDetailDeliveryId).toBeDefined();
    expect(orderDetailDelivery.orderDetailId).toBeDefined();
    expect(orderDetailDelivery.deliveryId).toBeDefined();
    expect(orderDetailDelivery.quantity).toBeDefined();
    expect(orderDetailDelivery.notes).toBeDefined();
  });

  it('should correctly link order details with deliveries', () => {
    const orderDetailDelivery: OrderDetailDelivery = {
      orderDetailDeliveryId: 4,
      orderDetailId: 10,
      deliveryId: 5,
      quantity: 25,
      notes: 'Partial delivery',
    };

    expect(orderDetailDelivery.orderDetailId).toBe(10);
    expect(orderDetailDelivery.deliveryId).toBe(5);
  });
});
