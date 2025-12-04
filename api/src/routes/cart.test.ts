import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cartRouter from './cart';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Cart API', () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required data: supplier and product
    const db = await getDatabase();
    await db.run('INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)', [1, 'Test Supplier']);
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, description, price, sku, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 'Test Product', 'Test Description', 99.99, 'TEST-001', 'piece']
    );

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/cart', cartRouter);
    // Attach error handler to translate repo errors
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should get or create cart for a session', async () => {
    const sessionId = 'test-session-123';
    const response = await request(app).get(`/cart/${sessionId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('cart');
    expect(response.body).toHaveProperty('items');
    expect(response.body.cart.sessionId).toBe(sessionId);
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  it('should reject invalid sessionId (too long)', async () => {
    const invalidSession = 'a'.repeat(300);
    const response = await request(app).get(`/cart/${invalidSession}`);
    expect(response.status).toBe(400);
  });

  it('should add item to cart', async () => {
    const sessionId = 'test-session-456';
    const response = await request(app)
      .post(`/cart/${sessionId}/items`)
      .send({ productId: 1, quantity: 2 });
    expect(response.status).toBe(201);
    expect(response.body.productId).toBe(1);
    expect(response.body.quantity).toBe(2);
  });

  it('should reject non-integer productId', async () => {
    const sessionId = 'test-session-789';
    const response = await request(app)
      .post(`/cart/${sessionId}/items`)
      .send({ productId: 1.5, quantity: 2 });
    expect(response.status).toBe(400);
  });

  it('should reject non-integer quantity', async () => {
    const sessionId = 'test-session-abc';
    const response = await request(app)
      .post(`/cart/${sessionId}/items`)
      .send({ productId: 1, quantity: 2.5 });
    expect(response.status).toBe(400);
  });

  it('should reject negative quantity', async () => {
    const sessionId = 'test-session-def';
    const response = await request(app)
      .post(`/cart/${sessionId}/items`)
      .send({ productId: 1, quantity: -1 });
    expect(response.status).toBe(400);
  });

  it('should update existing item quantity when adding duplicate product', async () => {
    const sessionId = 'test-session-ghi';
    // Add item first time
    await request(app)
      .post(`/cart/${sessionId}/items`)
      .send({ productId: 1, quantity: 2 });
    
    // Add same product again
    const response = await request(app)
      .post(`/cart/${sessionId}/items`)
      .send({ productId: 1, quantity: 3 });
    
    expect(response.status).toBe(201);
    
    // Verify cart has only one item with combined quantity
    const cartResponse = await request(app).get(`/cart/${sessionId}`);
    expect(cartResponse.body.items.length).toBe(1);
    expect(cartResponse.body.items[0].quantity).toBe(5);
  });

  it('should update cart item quantity', async () => {
    const sessionId = 'test-session-jkl';
    
    // Add item
    const addResponse = await request(app)
      .post(`/cart/${sessionId}/items`)
      .send({ productId: 1, quantity: 2 });
    
    const cartItemId = addResponse.body.cartItemId;
    
    // Update quantity
    const response = await request(app)
      .put(`/cart/${sessionId}/items/${cartItemId}`)
      .send({ quantity: 5 });
    
    expect(response.status).toBe(200);
    
    // Verify updated quantity
    const cartResponse = await request(app).get(`/cart/${sessionId}`);
    expect(cartResponse.body.items[0].quantity).toBe(5);
  });

  it('should reject non-integer quantity in update', async () => {
    const sessionId = 'test-session-mno';
    
    // Add item
    const addResponse = await request(app)
      .post(`/cart/${sessionId}/items`)
      .send({ productId: 1, quantity: 2 });
    
    const cartItemId = addResponse.body.cartItemId;
    
    // Try to update with decimal quantity
    const response = await request(app)
      .put(`/cart/${sessionId}/items/${cartItemId}`)
      .send({ quantity: 3.5 });
    
    expect(response.status).toBe(400);
  });

  it('should remove item from cart', async () => {
    const sessionId = 'test-session-pqr';
    
    // Add item
    const addResponse = await request(app)
      .post(`/cart/${sessionId}/items`)
      .send({ productId: 1, quantity: 2 });
    
    const cartItemId = addResponse.body.cartItemId;
    
    // Remove item
    const response = await request(app)
      .delete(`/cart/${sessionId}/items/${cartItemId}`);
    
    expect(response.status).toBe(204);
    
    // Verify item removed
    const cartResponse = await request(app).get(`/cart/${sessionId}`);
    expect(cartResponse.body.items.length).toBe(0);
  });

  it('should clear entire cart', async () => {
    const sessionId = 'test-session-stu';
    
    // Add items
    await request(app)
      .post(`/cart/${sessionId}/items`)
      .send({ productId: 1, quantity: 2 });
    
    // Clear cart
    const response = await request(app).delete(`/cart/${sessionId}`);
    expect(response.status).toBe(204);
    
    // Verify cart is empty
    const cartResponse = await request(app).get(`/cart/${sessionId}`);
    expect(cartResponse.body.items.length).toBe(0);
  });

  it('should return 404 when cart not found for update', async () => {
    const response = await request(app)
      .put(`/cart/non-existent-session/items/999`)
      .send({ quantity: 5 });
    
    expect(response.status).toBe(404);
  });

  it('should return 404 when cart not found for delete item', async () => {
    const response = await request(app)
      .delete(`/cart/non-existent-session/items/999`);
    
    expect(response.status).toBe(404);
  });

  it('should return 404 when cart not found for clear', async () => {
    const response = await request(app)
      .delete(`/cart/non-existent-session`);
    
    expect(response.status).toBe(404);
  });
});
