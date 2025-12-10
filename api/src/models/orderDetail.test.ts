import { describe, it, expect } from 'vitest';
import type { OrderDetail } from './orderDetail';

describe('OrderDetail Model', () => {
  it('should accept a valid order detail object', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 1,
      orderId: 1,
      productId: 1,
      quantity: 5,
      unitPrice: 10.99,
      notes: 'Test order detail',
    };

    expect(orderDetail.orderDetailId).toBe(1);
    expect(orderDetail.orderId).toBe(1);
    expect(orderDetail.productId).toBe(1);
    expect(orderDetail.quantity).toBe(5);
    expect(orderDetail.unitPrice).toBe(10.99);
    expect(orderDetail.notes).toBe('Test order detail');
  });

  it('should accept different quantities and prices', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 2,
      orderId: 1,
      productId: 2,
      quantity: 100,
      unitPrice: 0.99,
      notes: 'Bulk order',
    };

    expect(orderDetail.quantity).toBe(100);
    expect(orderDetail.unitPrice).toBe(0.99);
  });

  it('should have all required fields', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 3,
      orderId: 2,
      productId: 3,
      quantity: 1,
      unitPrice: 99.99,
      notes: 'Single item',
    };

    expect(orderDetail.orderDetailId).toBeDefined();
    expect(orderDetail.orderId).toBeDefined();
    expect(orderDetail.productId).toBeDefined();
    expect(orderDetail.quantity).toBeDefined();
    expect(orderDetail.unitPrice).toBeDefined();
    expect(orderDetail.notes).toBeDefined();
  });

  it('should handle decimal prices correctly', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 4,
      orderId: 1,
      productId: 1,
      quantity: 3,
      unitPrice: 12.99,
      notes: 'Test',
    };

    expect(orderDetail.unitPrice).toBe(12.99);
    expect(orderDetail.quantity * orderDetail.unitPrice).toBeCloseTo(38.97, 2);
  });
});
