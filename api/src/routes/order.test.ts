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
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required FK: headquarters and branch
    const db = await getDatabase();
    await db.run('INSERT INTO headquarters (headquarters_id, name) VALUES (?, ?)', [1, 'HQ One']);
    await db.run(
      'INSERT INTO branches (branch_id, headquarters_id, name) VALUES (?, ?, ?)',
      [1, 1, 'Branch One']
    );

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/orders', orderRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('GET /orders should return 200 and an empty array when no orders exist', async () => {
    const response = await request(app).get('/orders');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });

  it('POST /orders should create a new order and return 201', async () => {
    const newOrder = {
      branchId: 1,
      orderDate: '2024-03-01',
      name: 'Test Order',
      description: 'Test order description',
      status: 'pending'
    };

    const response = await request(app).post('/orders').send(newOrder);
    expect(response.status).toBe(201);
    expect(response.body.orderId).toBeDefined();
    expect(response.body.name).toBe('Test Order');
    expect(response.body.status).toBe('pending');
    expect(response.body.branchId).toBe(1);
  });

  it('GET /orders should return all orders', async () => {
    // Create two orders first
    const order1 = { branchId: 1, orderDate: '2024-03-01', name: 'Order One', description: '', status: 'pending' };
    const order2 = { branchId: 1, orderDate: '2024-03-02', name: 'Order Two', description: '', status: 'processing' };
    await request(app).post('/orders').send(order1);
    await request(app).post('/orders').send(order2);

    const response = await request(app).get('/orders');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('GET /orders/:id should return 200 and the order when found', async () => {
    const newOrder = { branchId: 1, orderDate: '2024-03-01', name: 'Lookup Order', description: '', status: 'pending' };
    const createResponse = await request(app).post('/orders').send(newOrder);
    const orderId = createResponse.body.orderId;

    const response = await request(app).get(`/orders/${orderId}`);
    expect(response.status).toBe(200);
    expect(response.body.orderId).toBe(orderId);
    expect(response.body.name).toBe('Lookup Order');
  });

  it('GET /orders/:id should return 404 when order not found', async () => {
    const response = await request(app).get('/orders/99999');
    expect(response.status).toBe(404);
  });

  it('PUT /orders/:id should update an existing order and return 200', async () => {
    const newOrder = { branchId: 1, orderDate: '2024-03-01', name: 'Original Order', description: '', status: 'pending' };
    const createResponse = await request(app).post('/orders').send(newOrder);
    const orderId = createResponse.body.orderId;

    const updatePayload = { branchId: 1, orderDate: '2024-03-01', name: 'Updated Order', description: '', status: 'processing' };
    const response = await request(app).put(`/orders/${orderId}`).send(updatePayload);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Order');
    expect(response.body.status).toBe('processing');
  });

  it('PUT /orders/:id should return 404 when order not found', async () => {
    const updatePayload = { name: 'Does Not Exist', status: 'pending' };
    const response = await request(app).put('/orders/99999').send(updatePayload);
    expect(response.status).toBe(404);
  });

  it('DELETE /orders/:id should return 204 on successful deletion', async () => {
    const newOrder = { branchId: 1, orderDate: '2024-03-01', name: 'Delete Me', description: '', status: 'pending' };
    const createResponse = await request(app).post('/orders').send(newOrder);
    const orderId = createResponse.body.orderId;

    const response = await request(app).delete(`/orders/${orderId}`);
    expect(response.status).toBe(204);
  });

  it('DELETE /orders/:id should return 404 when order not found', async () => {
    const response = await request(app).delete('/orders/99999');
    expect(response.status).toBe(404);
  });
});
