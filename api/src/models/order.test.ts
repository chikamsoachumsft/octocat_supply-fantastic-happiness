import { describe, it, expect } from 'vitest';
import { Order } from './order';

describe('Order Model', () => {
  it('should create a valid order object', () => {
    const order: Order = {
      orderId: 1,
      branchId: 1,
      orderDate: '2024-01-15',
      name: 'Q1 Cat Tech Order',
      description: 'Quarterly restock of smart cat products',
      status: 'pending',
    };

    expect(order.orderId).toBe(1);
    expect(order.branchId).toBe(1);
    expect(order.orderDate).toBe('2024-01-15');
    expect(order.name).toBe('Q1 Cat Tech Order');
    expect(order.description).toBe('Quarterly restock of smart cat products');
    expect(order.status).toBe('pending');
  });

  it('should support different status values', () => {
    const pendingOrder: Order = {
      orderId: 1,
      branchId: 1,
      orderDate: '2024-01-15',
      name: 'Pending Order',
      description: 'Test',
      status: 'pending',
    };

    const completedOrder: Order = {
      orderId: 2,
      branchId: 1,
      orderDate: '2024-01-16',
      name: 'Completed Order',
      description: 'Test',
      status: 'completed',
    };

    expect(pendingOrder.status).toBe('pending');
    expect(completedOrder.status).toBe('completed');
  });

  it('should have all required properties', () => {
    const order: Order = {
      orderId: 1,
      branchId: 1,
      orderDate: '2024-01-15',
      name: 'Test Order',
      description: 'Test',
      status: 'pending',
    };

    expect(order).toHaveProperty('orderId');
    expect(order).toHaveProperty('branchId');
    expect(order).toHaveProperty('orderDate');
    expect(order).toHaveProperty('name');
    expect(order).toHaveProperty('description');
    expect(order).toHaveProperty('status');
  });

  it('should validate property types', () => {
    const order: Order = {
      orderId: 1,
      branchId: 1,
      orderDate: '2024-01-15',
      name: 'Type Test Order',
      description: 'Testing types',
      status: 'pending',
    };

    expect(typeof order.orderId).toBe('number');
    expect(typeof order.branchId).toBe('number');
    expect(typeof order.orderDate).toBe('string');
    expect(typeof order.name).toBe('string');
    expect(typeof order.description).toBe('string');
    expect(typeof order.status).toBe('string');
  });
});
