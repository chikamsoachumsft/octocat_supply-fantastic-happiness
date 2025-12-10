import { describe, it, expect } from 'vitest';
import type { Order } from './order';

describe('Order Model', () => {
  it('should accept a valid order object', () => {
    const order: Order = {
      orderId: 1,
      branchId: 1,
      orderDate: '2024-01-15',
      name: 'Test Order',
      description: 'Test order description',
      status: 'pending',
    };

    expect(order.orderId).toBe(1);
    expect(order.branchId).toBe(1);
    expect(order.orderDate).toBe('2024-01-15');
    expect(order.name).toBe('Test Order');
    expect(order.description).toBe('Test order description');
    expect(order.status).toBe('pending');
  });

  it('should accept different order statuses', () => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    statuses.forEach((status, index) => {
      const order: Order = {
        orderId: index + 1,
        branchId: 1,
        orderDate: '2024-01-15',
        name: `Order ${index + 1}`,
        description: 'Test',
        status,
      };

      expect(order.status).toBe(status);
    });
  });

  it('should have all required fields', () => {
    const order: Order = {
      orderId: 10,
      branchId: 5,
      orderDate: '2024-01-20',
      name: 'Required Order',
      description: 'Description',
      status: 'pending',
    };

    expect(order.orderId).toBeDefined();
    expect(order.branchId).toBeDefined();
    expect(order.orderDate).toBeDefined();
    expect(order.name).toBeDefined();
    expect(order.description).toBeDefined();
    expect(order.status).toBeDefined();
  });
});
