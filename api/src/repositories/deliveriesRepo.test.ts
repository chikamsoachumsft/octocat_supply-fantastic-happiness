import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeliveriesRepository } from '../repositories/deliveriesRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
    getDatabase: vi.fn()
}));

import { getDatabase } from '../db/sqlite';

describe('DeliveriesRepository', () => {
    let repository: DeliveriesRepository;
    let mockDb: any;

    beforeEach(() => {
        mockDb = {
            db: {} as any,
            run: vi.fn(),
            get: vi.fn(),
            all: vi.fn(),
            close: vi.fn()
        };

        (getDatabase as any).mockResolvedValue(mockDb);

        repository = new DeliveriesRepository(mockDb);
        vi.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all deliveries', async () => {
            const mockRows = [
                { delivery_id: 1, supplier_id: 1, delivery_date: '2024-01-10', name: 'Delivery A', description: 'Desc A', status: 'pending' },
                { delivery_id: 2, supplier_id: 2, delivery_date: '2024-01-11', name: 'Delivery B', description: 'Desc B', status: 'delivered' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findAll();

            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM deliveries ORDER BY delivery_id');
            expect(result).toHaveLength(2);
            expect(result[0].deliveryId).toBe(1);
            expect(result[0].name).toBe('Delivery A');
        });

        it('should return empty array when no deliveries exist', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return delivery when found', async () => {
            const mockRow = { delivery_id: 1, supplier_id: 1, delivery_date: '2024-01-10', name: 'Delivery A', description: 'Desc', status: 'pending' };
            mockDb.get.mockResolvedValue(mockRow);

            const result = await repository.findById(1);

            expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM deliveries WHERE delivery_id = ?', [1]);
            expect(result?.deliveryId).toBe(1);
            expect(result?.name).toBe('Delivery A');
        });

        it('should return null when delivery not found', async () => {
            mockDb.get.mockResolvedValue(undefined);

            const result = await repository.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should insert a new delivery and return it with generated deliveryId', async () => {
            const newDelivery = {
                supplierId: 1,
                deliveryDate: '2024-04-01',
                name: 'Spring Delivery',
                description: 'Spring stock',
                status: 'pending'
            };

            mockDb.run.mockResolvedValue({ lastID: 4, changes: 1 });
            mockDb.get.mockResolvedValue({
                delivery_id: 4,
                supplier_id: 1,
                delivery_date: '2024-04-01',
                name: 'Spring Delivery',
                description: 'Spring stock',
                status: 'pending'
            });

            const result = await repository.create(newDelivery);

            expect(mockDb.run).toHaveBeenCalled();
            expect(result.deliveryId).toBe(4);
            expect(result.name).toBe('Spring Delivery');
        });
    });

    describe('update', () => {
        it('should update an existing delivery and return updated data', async () => {
            const updateData = { status: 'delivered' };

            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({
                delivery_id: 1,
                supplier_id: 1,
                delivery_date: '2024-01-10',
                name: 'Delivery A',
                description: 'Desc',
                status: 'delivered'
            });

            const result = await repository.update(1, updateData);

            expect(result.status).toBe('delivered');
        });

        it('should throw NotFoundError when delivery does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });

            await expect(repository.update(999, { status: 'delivered' })).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete an existing delivery', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });

            await repository.delete(1);

            expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM deliveries WHERE delivery_id = ?', [1]);
        });

        it('should throw NotFoundError when delivery does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });

            await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('exists', () => {
        it('should return true when delivery exists', async () => {
            mockDb.get.mockResolvedValue({ count: 1 });

            const result = await repository.exists(1);

            expect(result).toBe(true);
            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM deliveries WHERE delivery_id = ?',
                [1]
            );
        });

        it('should return false when delivery does not exist', async () => {
            mockDb.get.mockResolvedValue({ count: 0 });

            const result = await repository.exists(999);

            expect(result).toBe(false);
        });
    });

    describe('findBySupplierId', () => {
        it('should return deliveries for a given supplier', async () => {
            const mockRows = [
                { delivery_id: 1, supplier_id: 3, delivery_date: '2024-02-10', name: 'Delivery X', description: '', status: 'pending' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findBySupplierId(3);

            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM deliveries WHERE supplier_id = ? ORDER BY delivery_date DESC',
                [3]
            );
            expect(result).toHaveLength(1);
            expect(result[0].supplierId).toBe(3);
        });

        it('should return empty array for unknown supplier', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findBySupplierId(999);

            expect(result).toEqual([]);
        });
    });

    describe('findByStatus', () => {
        it('should return deliveries with the given status', async () => {
            const mockRows = [
                { delivery_id: 2, supplier_id: 1, delivery_date: '2024-01-11', name: 'Delivery B', description: '', status: 'delivered' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findByStatus('delivered');

            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM deliveries WHERE status = ? ORDER BY delivery_date DESC',
                ['delivered']
            );
            expect(result).toHaveLength(1);
            expect(result[0].status).toBe('delivered');
        });
    });

    describe('findByDateRange', () => {
        it('should return deliveries within the date range', async () => {
            const mockRows = [
                { delivery_id: 1, supplier_id: 1, delivery_date: '2024-03-15', name: 'Mid Mar Delivery', description: '', status: 'pending' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findByDateRange('2024-03-01', '2024-03-31');

            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM deliveries WHERE delivery_date >= ? AND delivery_date <= ? ORDER BY delivery_date DESC',
                ['2024-03-01', '2024-03-31']
            );
            expect(result).toHaveLength(1);
            expect(result[0].deliveryDate).toBe('2024-03-15');
        });

        it('should return empty array when no deliveries fall in the date range', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findByDateRange('2020-01-01', '2020-01-31');

            expect(result).toEqual([]);
        });
    });
});
