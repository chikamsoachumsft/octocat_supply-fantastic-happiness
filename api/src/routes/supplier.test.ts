import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import supplierRouter from './supplier';
import type { Supplier } from '../models/supplier';
import { getSuppliersRepository } from '../repositories/suppliersRepo';

vi.mock('../repositories/suppliersRepo');

type SuppliersRepository = Awaited<ReturnType<typeof getSuppliersRepository>>;

const mockSuppliersRepo = {
  findById: vi.fn<(id: number) => Promise<Supplier | null>>(),
  update: vi.fn<(id: number, supplier: Partial<Omit<Supplier, 'supplierId'>>) => Promise<Supplier>>(),
};

const baseSupplier: Supplier = {
  supplierId: 1,
  name: 'Acme Supplies',
  description: 'Reliable supplier',
  contactPerson: 'Jane Doe',
  email: 'jane@acme.com',
  phone: '+1-555-0100',
  active: true,
  verified: false,
};

describe('PATCH /suppliers/:id/verify', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSuppliersRepository).mockResolvedValue(
      mockSuppliersRepo as unknown as SuppliersRepository,
    );

    app = express();
    app.use(express.json());
    app.use('/suppliers', supplierRouter);
    app.use(
      (error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: message });
      },
    );
  });

  it('returns 200 and verified supplier for an active supplier', async () => {
    mockSuppliersRepo.findById.mockResolvedValue(baseSupplier);
    mockSuppliersRepo.update.mockResolvedValue({ ...baseSupplier, verified: true });

    const response = await request(app).patch('/suppliers/1/verify');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ supplierId: 1, verified: true });
    expect(mockSuppliersRepo.findById).toHaveBeenCalledWith(1);
    expect(mockSuppliersRepo.update).toHaveBeenCalledWith(1, { verified: true });
  });

  it('returns 404 when supplier is not found', async () => {
    mockSuppliersRepo.findById.mockResolvedValue(null);

    const response = await request(app).patch('/suppliers/999/verify');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Supplier not found' });
    expect(mockSuppliersRepo.update).not.toHaveBeenCalled();
  });

  it('returns 422 when supplier is inactive', async () => {
    mockSuppliersRepo.findById.mockResolvedValue({ ...baseSupplier, active: false });

    const response = await request(app).patch('/suppliers/1/verify');

    expect(response.status).toBe(422);
    expect(response.body).toEqual({ error: 'Cannot verify an inactive supplier' });
    expect(mockSuppliersRepo.update).not.toHaveBeenCalled();
  });

  it('returns 500 when repository throws an unexpected error', async () => {
    mockSuppliersRepo.findById.mockRejectedValue(new Error('Unexpected failure'));

    const response = await request(app).patch('/suppliers/1/verify');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Unexpected failure' });
    expect(mockSuppliersRepo.update).not.toHaveBeenCalled();
  });
});
