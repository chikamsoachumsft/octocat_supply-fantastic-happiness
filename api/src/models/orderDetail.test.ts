import { describe, it, expect } from 'vitest';
import { OrderDetail } from './orderDetail';

describe('OrderDetail Model', () => {
  it('should create a valid order detail object', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 1,
      orderId: 1,
      productId: 1,
      quantity: 10,
      unitPrice: 99.99,
      notes: 'First order detail',
    };

    expect(orderDetail.orderDetailId).toBe(1);
    expect(orderDetail.orderId).toBe(1);
    expect(orderDetail.productId).toBe(1);
    expect(orderDetail.quantity).toBe(10);
    expect(orderDetail.unitPrice).toBe(99.99);
    expect(orderDetail.notes).toBe('First order detail');
  });

  it('should support different quantity and price values', () => {
    const smallOrder: OrderDetail = {
      orderDetailId: 1,
      orderId: 1,
      productId: 1,
      quantity: 1,
      unitPrice: 9.99,
      notes: 'Small quantity',
    };

    const largeOrder: OrderDetail = {
      orderDetailId: 2,
      orderId: 1,
      productId: 2,
      quantity: 100,
      unitPrice: 199.99,
      notes: 'Large quantity',
    };

    expect(smallOrder.quantity).toBe(1);
    expect(smallOrder.unitPrice).toBe(9.99);
    expect(largeOrder.quantity).toBe(100);
    expect(largeOrder.unitPrice).toBe(199.99);
  });

  it('should have all required properties', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 1,
      orderId: 1,
      productId: 1,
      quantity: 5,
      unitPrice: 49.99,
      notes: 'Test',
    };

    expect(orderDetail).toHaveProperty('orderDetailId');
    expect(orderDetail).toHaveProperty('orderId');
    expect(orderDetail).toHaveProperty('productId');
    expect(orderDetail).toHaveProperty('quantity');
    expect(orderDetail).toHaveProperty('unitPrice');
    expect(orderDetail).toHaveProperty('notes');
  });

  it('should validate property types', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 1,
      orderId: 1,
      productId: 1,
      quantity: 15,
      unitPrice: 79.99,
      notes: 'Type test',
    };

    expect(typeof orderDetail.orderDetailId).toBe('number');
    expect(typeof orderDetail.orderId).toBe('number');
    expect(typeof orderDetail.productId).toBe('number');
    expect(typeof orderDetail.quantity).toBe('number');
    expect(typeof orderDetail.unitPrice).toBe('number');
    expect(typeof orderDetail.notes).toBe('string');
  });
});
