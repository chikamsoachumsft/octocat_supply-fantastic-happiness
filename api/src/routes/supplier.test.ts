import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import supplierRouter from './supplier';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Supplier API', () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/suppliers', supplierRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  const newSupplier = {
    name: 'Test Supplier',
    description: 'A test supplier',
    contactPerson: 'Jane Smith',
    email: 'jane@test.com',
    phone: '555-0100',
    active: true,
    verified: false,
  };

  describe('GET /suppliers', () => {
    it('should return 200 with an array', async () => {
      const response = await request(app).get('/suppliers');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /suppliers', () => {
    it('should return 201 on success', async () => {
      const response = await request(app).post('/suppliers').send(newSupplier);
      expect(response.status).toBe(201);
      expect(response.body.supplierId).toBeDefined();
      expect(response.body.name).toBe(newSupplier.name);
    });
  });

  describe('GET /suppliers/:id', () => {
    it('should return 200 when supplier is found', async () => {
      const createRes = await request(app).post('/suppliers').send(newSupplier);
      const supplierId = createRes.body.supplierId;

      const response = await request(app).get(`/suppliers/${supplierId}`);
      expect(response.status).toBe(200);
      expect(response.body.supplierId).toBe(supplierId);
    });

    it('should return 404 when supplier is not found', async () => {
      const response = await request(app).get('/suppliers/999');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /suppliers/:id', () => {
    it('should return 200 on success', async () => {
      const createRes = await request(app).post('/suppliers').send(newSupplier);
      const supplierId = createRes.body.supplierId;

      const response = await request(app)
        .put(`/suppliers/${supplierId}`)
        .send({ name: 'Updated Supplier' });
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Supplier');
    });

    it('should return 404 when supplier is not found', async () => {
      const response = await request(app)
        .put('/suppliers/999')
        .send({ name: 'Updated Supplier' });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /suppliers/:id', () => {
    it('should return 204 on success', async () => {
      const createRes = await request(app).post('/suppliers').send(newSupplier);
      const supplierId = createRes.body.supplierId;

      const response = await request(app).delete(`/suppliers/${supplierId}`);
      expect(response.status).toBe(204);
    });

    it('should return 404 when supplier is not found', async () => {
      const response = await request(app).delete('/suppliers/999');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /suppliers/stats', () => {
    it('should return 200 with SupplierStats shape on empty database', async () => {
      const response = await request(app).get('/suppliers/stats');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        total: 0,
        active: 0,
        inactive: 0,
        verified: 0,
        pendingVerification: 0,
      });
    });

    it('should return correct counts when suppliers exist', async () => {
      // active=true, verified=false
      await request(app).post('/suppliers').send({ ...newSupplier, active: true, verified: false });
      // active=true, verified=true
      await request(app).post('/suppliers').send({ ...newSupplier, active: true, verified: true });
      // active=false, verified=false
      await request(app).post('/suppliers').send({ ...newSupplier, active: false, verified: false });

      const response = await request(app).get('/suppliers/stats');
      expect(response.status).toBe(200);
      expect(response.body.total).toBe(3);
      expect(response.body.active).toBe(2);
      expect(response.body.inactive).toBe(1);
      expect(response.body.verified).toBe(1);
      expect(response.body.pendingVerification).toBe(2);
    });

    it('should not be misinterpreted as /:id (route ordering check)', async () => {
      // If /stats were matched by /:id, it would try parseInt('stats') = NaN
      // and the repo would fail or return 404. This confirms /stats resolves correctly.
      const response = await request(app).get('/suppliers/stats');
      expect(response.status).toBe(200);
      expect(typeof response.body.total).toBe('number');
    });
  });
});
