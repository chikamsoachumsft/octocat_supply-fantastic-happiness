import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersRepository } from '../repositories/ordersRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
    getDatabase: vi.fn()
}));

import { getDatabase } from '../db/sqlite';

describe('OrdersRepository', () => {
    let repository: OrdersRepository;
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

        repository = new OrdersRepository(mockDb);
        vi.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all orders', async () => {
            const mockRows = [
                { order_id: 1, branch_id: 1, order_date: '2024-01-01', name: 'Order A', description: 'Desc A', status: 'pending' },
                { order_id: 2, branch_id: 2, order_date: '2024-01-02', name: 'Order B', description: 'Desc B', status: 'shipped' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findAll();

            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM orders ORDER BY order_id');
            expect(result).toHaveLength(2);
            expect(result[0].orderId).toBe(1);
            expect(result[0].name).toBe('Order A');
            expect(result[1].orderId).toBe(2);
        });

        it('should return empty array when no orders exist', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return order when found', async () => {
            const mockRow = { order_id: 1, branch_id: 1, order_date: '2024-01-01', name: 'Order A', description: 'Desc', status: 'pending' };
            mockDb.get.mockResolvedValue(mockRow);

            const result = await repository.findById(1);

            expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM orders WHERE order_id = ?', [1]);
            expect(result?.orderId).toBe(1);
            expect(result?.name).toBe('Order A');
        });

        it('should return null when order not found', async () => {
            mockDb.get.mockResolvedValue(undefined);

            const result = await repository.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should insert a new order and return it with generated orderId', async () => {
            const newOrder = {
                branchId: 1,
                orderDate: '2024-03-01',
                name: 'New Order',
                description: 'New description',
                status: 'pending'
            };

            mockDb.run.mockResolvedValue({ lastID: 5, changes: 1 });
            mockDb.get.mockResolvedValue({
                order_id: 5,
                branch_id: 1,
                order_date: '2024-03-01',
                name: 'New Order',
                description: 'New description',
                status: 'pending'
            });

            const result = await repository.create(newOrder);

            expect(mockDb.run).toHaveBeenCalled();
            expect(result.orderId).toBe(5);
            expect(result.name).toBe('New Order');
            expect(result.status).toBe('pending');
        });
    });

    describe('update', () => {
        it('should update an existing order and return updated data', async () => {
            const updateData = { name: 'Updated Order', status: 'processing' };

            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({
                order_id: 1,
                branch_id: 1,
                order_date: '2024-01-01',
                name: 'Updated Order',
                description: 'Desc',
                status: 'processing'
            });

            const result = await repository.update(1, updateData);

            expect(result.name).toBe('Updated Order');
            expect(result.status).toBe('processing');
        });

        it('should throw NotFoundError when order does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });

            await expect(repository.update(999, { name: 'x' })).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete an existing order', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });

            await repository.delete(1);

            expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM orders WHERE order_id = ?', [1]);
        });

        it('should throw NotFoundError when order does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });

            await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('exists', () => {
        it('should return true when order exists', async () => {
            mockDb.get.mockResolvedValue({ count: 1 });

            const result = await repository.exists(1);

            expect(result).toBe(true);
            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM orders WHERE order_id = ?',
                [1]
            );
        });

        it('should return false when order does not exist', async () => {
            mockDb.get.mockResolvedValue({ count: 0 });

            const result = await repository.exists(999);

            expect(result).toBe(false);
        });
    });

    describe('findByBranchId', () => {
        it('should return orders for a given branch', async () => {
            const mockRows = [
                { order_id: 1, branch_id: 2, order_date: '2024-01-01', name: 'Order X', description: '', status: 'pending' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findByBranchId(2);

            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM orders WHERE branch_id = ? ORDER BY order_date DESC',
                [2]
            );
            expect(result).toHaveLength(1);
            expect(result[0].branchId).toBe(2);
        });

        it('should return empty array for unknown branch', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findByBranchId(999);

            expect(result).toEqual([]);
        });
    });

    describe('findByStatus', () => {
        it('should return orders with the given status', async () => {
            const mockRows = [
                { order_id: 1, branch_id: 1, order_date: '2024-01-01', name: 'Order Y', description: '', status: 'shipped' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findByStatus('shipped');

            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM orders WHERE status = ? ORDER BY order_date DESC',
                ['shipped']
            );
            expect(result).toHaveLength(1);
            expect(result[0].status).toBe('shipped');
        });

        it('should return empty array when no orders match the status', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findByStatus('cancelled');

            expect(result).toEqual([]);
        });
    });

    describe('findByDateRange', () => {
        it('should return orders within the date range', async () => {
            const mockRows = [
                { order_id: 1, branch_id: 1, order_date: '2024-02-15', name: 'Mid Feb Order', description: '', status: 'pending' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findByDateRange('2024-02-01', '2024-02-28');

            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM orders WHERE order_date >= ? AND order_date <= ? ORDER BY order_date DESC',
                ['2024-02-01', '2024-02-28']
            );
            expect(result).toHaveLength(1);
            expect(result[0].orderDate).toBe('2024-02-15');
        });

        it('should return empty array when no orders fall in the date range', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findByDateRange('2020-01-01', '2020-01-31');

            expect(result).toEqual([]);
        });
    });
});
