import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderDetailsRepository } from '../repositories/orderDetailsRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
    getDatabase: vi.fn()
}));

import { getDatabase } from '../db/sqlite';

describe('OrderDetailsRepository', () => {
    let repository: OrderDetailsRepository;
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

        repository = new OrderDetailsRepository(mockDb);
        vi.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all order details', async () => {
            const mockRows = [
                { order_detail_id: 1, order_id: 1, product_id: 1, quantity: 5, unit_price: 10.0, notes: 'Note A' },
                { order_detail_id: 2, order_id: 1, product_id: 2, quantity: 3, unit_price: 20.0, notes: 'Note B' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findAll();

            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM order_details ORDER BY order_detail_id');
            expect(result).toHaveLength(2);
            expect(result[0].orderDetailId).toBe(1);
            expect(result[0].quantity).toBe(5);
        });

        it('should return empty array when no order details exist', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return order detail when found', async () => {
            const mockRow = { order_detail_id: 1, order_id: 1, product_id: 1, quantity: 5, unit_price: 10.0, notes: 'Note A' };
            mockDb.get.mockResolvedValue(mockRow);

            const result = await repository.findById(1);

            expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM order_details WHERE order_detail_id = ?', [1]);
            expect(result?.orderDetailId).toBe(1);
            expect(result?.quantity).toBe(5);
        });

        it('should return null when order detail not found', async () => {
            mockDb.get.mockResolvedValue(undefined);

            const result = await repository.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should insert a new order detail and return it with generated orderDetailId', async () => {
            const newDetail = {
                orderId: 1,
                productId: 3,
                quantity: 10,
                unitPrice: 15.5,
                notes: 'Rush order'
            };

            mockDb.run.mockResolvedValue({ lastID: 5, changes: 1 });
            mockDb.get.mockResolvedValue({
                order_detail_id: 5,
                order_id: 1,
                product_id: 3,
                quantity: 10,
                unit_price: 15.5,
                notes: 'Rush order'
            });

            const result = await repository.create(newDetail);

            expect(mockDb.run).toHaveBeenCalled();
            expect(result.orderDetailId).toBe(5);
            expect(result.quantity).toBe(10);
            expect(result.unitPrice).toBe(15.5);
        });
    });

    describe('update', () => {
        it('should update an existing order detail and return updated data', async () => {
            const updateData = { quantity: 20, notes: 'Updated note' };

            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({
                order_detail_id: 1,
                order_id: 1,
                product_id: 1,
                quantity: 20,
                unit_price: 10.0,
                notes: 'Updated note'
            });

            const result = await repository.update(1, updateData);

            expect(result.quantity).toBe(20);
            expect(result.notes).toBe('Updated note');
        });

        it('should throw NotFoundError when order detail does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });

            await expect(repository.update(999, { quantity: 1 })).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete an existing order detail', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });

            await repository.delete(1);

            expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM order_details WHERE order_detail_id = ?', [1]);
        });

        it('should throw NotFoundError when order detail does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });

            await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('exists', () => {
        it('should return true when order detail exists', async () => {
            mockDb.get.mockResolvedValue({ count: 1 });

            const result = await repository.exists(1);

            expect(result).toBe(true);
            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM order_details WHERE order_detail_id = ?',
                [1]
            );
        });

        it('should return false when order detail does not exist', async () => {
            mockDb.get.mockResolvedValue({ count: 0 });

            const result = await repository.exists(999);

            expect(result).toBe(false);
        });
    });

    describe('findByOrderId', () => {
        it('should return order details for a given order', async () => {
            const mockRows = [
                { order_detail_id: 1, order_id: 2, product_id: 1, quantity: 5, unit_price: 10.0, notes: '' },
                { order_detail_id: 2, order_id: 2, product_id: 2, quantity: 3, unit_price: 25.0, notes: '' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findByOrderId(2);

            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM order_details WHERE order_id = ? ORDER BY order_detail_id',
                [2]
            );
            expect(result).toHaveLength(2);
            expect(result[0].orderId).toBe(2);
        });

        it('should return empty array for unknown order', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findByOrderId(999);

            expect(result).toEqual([]);
        });
    });

    describe('findByProductId', () => {
        it('should return order details for a given product', async () => {
            const mockRows = [
                { order_detail_id: 1, order_id: 1, product_id: 5, quantity: 2, unit_price: 50.0, notes: '' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findByProductId(5);

            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM order_details WHERE product_id = ? ORDER BY order_detail_id',
                [5]
            );
            expect(result).toHaveLength(1);
            expect(result[0].productId).toBe(5);
        });
    });

    describe('getTotalValueByOrderId', () => {
        it('should return the total value for an order', async () => {
            mockDb.get.mockResolvedValue({ total: 125.5 });

            const result = await repository.getTotalValueByOrderId(1);

            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT SUM(quantity * unit_price) as total FROM order_details WHERE order_id = ?',
                [1]
            );
            expect(result).toBe(125.5);
        });

        it('should return 0 when order has no details', async () => {
            mockDb.get.mockResolvedValue({ total: null });

            const result = await repository.getTotalValueByOrderId(999);

            expect(result).toBe(0);
        });
    });
});
