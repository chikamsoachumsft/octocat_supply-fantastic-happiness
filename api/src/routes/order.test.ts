import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import orderRouter from './order';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Order API', () => {
  beforeEach(async () => {
    // Fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    const db = await getDatabase();
    // Seed headquarters + default guest branch (id=1 matches DEFAULT_GUEST_BRANCH_ID)
    await db.run('INSERT INTO headquarters (headquarters_id, name) VALUES (?, ?)', [1, 'HQ One']);
    await db.run(
      'INSERT INTO branches (branch_id, headquarters_id, name) VALUES (?, ?, ?)',
      [1, 1, 'Default Guest Branch'],
    );
    // Seed a supplier + products with stock
    await db.run('INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)', [1, 'Supplier A']);
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, price, sku, unit, stock_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 'Widget', 10.0, 'W-001', 'each', 50],
    );
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, price, sku, unit, stock_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [2, 1, 'Gadget', 20.0, 'G-001', 'each', 5],
    );

    app = express();
    app.use(express.json());
    app.use('/orders', orderRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  // ---------------------------------------------------------------------------
  // Traditional path (backward compatibility)
  // ---------------------------------------------------------------------------
  describe('POST /orders — traditional path (no items)', () => {
    it('should create an order without an items array (201)', async () => {
      const payload = {
        branchId: 1,
        orderDate: '2024-01-01T00:00:00.000Z',
        name: 'Manual Order',
        description: 'Created via traditional path',
        status: 'pending',
      };

      const response = await request(app).post('/orders').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.orderId).toBeDefined();
      expect(response.body.branchId).toBe(1);
      expect(response.body.name).toBe('Manual Order');
    });
  });

  // ---------------------------------------------------------------------------
  // Guest checkout path (items array present)
  // ---------------------------------------------------------------------------
  describe('POST /orders — guest checkout with items', () => {
    it('should create order + order details and decrement stock (201, happy path)', async () => {
      const payload = {
        customerName: 'Alice Smith',
        customerEmail: 'alice@example.com',
        items: [{ productId: 1, quantity: 3, unitPrice: 10.0 }],
      };

      const response = await request(app).post('/orders').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.orderId).toBeDefined();
      expect(response.body.orderDetails).toHaveLength(1);

      // Stock should have been decremented
      const db = await getDatabase();
      const product = await db.get<{ stock_level: number }>(
        'SELECT stock_level FROM products WHERE product_id = 1',
      );
      expect(product?.stock_level).toBe(47);
    });

    it('should use DEFAULT_GUEST_BRANCH_ID=1 when branchId is not provided', async () => {
      const payload = {
        items: [{ productId: 1, quantity: 1, unitPrice: 10.0 }],
      };

      const response = await request(app).post('/orders').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.branchId).toBe(1);
    });

    it('should propagate customerName and customerEmail to the response', async () => {
      const payload = {
        customerName: 'Bob Jones',
        customerEmail: 'bob@example.com',
        items: [{ productId: 1, quantity: 1, unitPrice: 10.0 }],
      };

      const response = await request(app).post('/orders').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.customerName).toBe('Bob Jones');
      expect(response.body.customerEmail).toBe('bob@example.com');
    });

    it('should handle multiple items, create all order details and decrement each product stock', async () => {
      const payload = {
        items: [
          { productId: 1, quantity: 2, unitPrice: 10.0 },
          { productId: 2, quantity: 1, unitPrice: 20.0 },
        ],
      };

      const response = await request(app).post('/orders').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.orderDetails).toHaveLength(2);

      const db = await getDatabase();
      const p1 = await db.get<{ stock_level: number }>(
        'SELECT stock_level FROM products WHERE product_id = 1',
      );
      const p2 = await db.get<{ stock_level: number }>(
        'SELECT stock_level FROM products WHERE product_id = 2',
      );
      expect(p1?.stock_level).toBe(48);
      expect(p2?.stock_level).toBe(4);
    });

    it('should return 400 with a descriptive message when one item has insufficient stock', async () => {
      const payload = {
        items: [{ productId: 2, quantity: 10, unitPrice: 20.0 }], // only 5 in stock
      };

      const response = await request(app).post('/orders').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toMatch(/2/); // product id in message
    });

    it('should return 400 with the product ID in the message when a product is not found', async () => {
      const payload = {
        items: [{ productId: 999, quantity: 1, unitPrice: 10.0 }],
      };

      const response = await request(app).post('/orders').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/999/);
    });
  });
});
