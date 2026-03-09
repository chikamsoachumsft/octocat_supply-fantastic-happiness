import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductsRepository } from '../repositories/productsRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
    getDatabase: vi.fn()
}));

import { getDatabase } from '../db/sqlite';

describe('ProductsRepository', () => {
    let repository: ProductsRepository;
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

        repository = new ProductsRepository(mockDb);
        vi.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all products', async () => {
            const mockRows = [
                { product_id: 1, supplier_id: 1, name: 'Widget A', description: 'Desc A', price: 9.99, sku: 'WGT-A', unit: 'each', img_name: 'a.png', discount: 0 },
                { product_id: 2, supplier_id: 1, name: 'Widget B', description: 'Desc B', price: 19.99, sku: 'WGT-B', unit: 'each', img_name: 'b.png', discount: 0.1 }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findAll();

            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM products ORDER BY product_id');
            expect(result).toHaveLength(2);
            expect(result[0].productId).toBe(1);
            expect(result[0].name).toBe('Widget A');
        });

        it('should return empty array when no products exist', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return product when found', async () => {
            const mockRow = { product_id: 1, supplier_id: 1, name: 'Widget A', description: 'Desc A', price: 9.99, sku: 'WGT-A', unit: 'each', img_name: 'a.png', discount: 0 };
            mockDb.get.mockResolvedValue(mockRow);

            const result = await repository.findById(1);

            expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM products WHERE product_id = ?', [1]);
            expect(result?.productId).toBe(1);
            expect(result?.name).toBe('Widget A');
        });

        it('should return null when product not found', async () => {
            mockDb.get.mockResolvedValue(undefined);

            const result = await repository.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should insert a new product and return it with generated productId', async () => {
            const newProduct = {
                supplierId: 1,
                name: 'Gadget Z',
                description: 'New gadget',
                price: 49.99,
                sku: 'GDG-Z',
                unit: 'box',
                imgName: 'z.png',
                discount: 0
            };

            mockDb.run.mockResolvedValue({ lastID: 3, changes: 1 });
            mockDb.get.mockResolvedValue({
                product_id: 3,
                supplier_id: 1,
                name: 'Gadget Z',
                description: 'New gadget',
                price: 49.99,
                sku: 'GDG-Z',
                unit: 'box',
                img_name: 'z.png',
                discount: 0
            });

            const result = await repository.create(newProduct);

            expect(mockDb.run).toHaveBeenCalled();
            expect(result.productId).toBe(3);
            expect(result.name).toBe('Gadget Z');
            expect(result.price).toBe(49.99);
        });
    });

    describe('update', () => {
        it('should update an existing product and return updated data', async () => {
            const updateData = { name: 'Widget A Pro', price: 14.99 };

            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({
                product_id: 1,
                supplier_id: 1,
                name: 'Widget A Pro',
                description: 'Desc A',
                price: 14.99,
                sku: 'WGT-A',
                unit: 'each',
                img_name: 'a.png',
                discount: 0
            });

            const result = await repository.update(1, updateData);

            expect(result.name).toBe('Widget A Pro');
            expect(result.price).toBe(14.99);
        });

        it('should throw NotFoundError when product does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });

            await expect(repository.update(999, { name: 'x' })).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete an existing product', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });

            await repository.delete(1);

            expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM products WHERE product_id = ?', [1]);
        });

        it('should throw NotFoundError when product does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });

            await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('exists', () => {
        it('should return true when product exists', async () => {
            mockDb.get.mockResolvedValue({ count: 1 });

            const result = await repository.exists(1);

            expect(result).toBe(true);
            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM products WHERE product_id = ?',
                [1]
            );
        });

        it('should return false when product does not exist', async () => {
            mockDb.get.mockResolvedValue({ count: 0 });

            const result = await repository.exists(999);

            expect(result).toBe(false);
        });
    });

    describe('findBySupplierId', () => {
        it('should return products for a given supplier', async () => {
            const mockRows = [
                { product_id: 1, supplier_id: 2, name: 'Widget A', description: '', price: 9.99, sku: 'WGT-A', unit: 'each', img_name: 'a.png', discount: 0 }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findBySupplierId(2);

            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM products WHERE supplier_id = ? ORDER BY name',
                [2]
            );
            expect(result).toHaveLength(1);
            expect(result[0].supplierId).toBe(2);
        });

        it('should return empty array for unknown supplier', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findBySupplierId(999);

            expect(result).toEqual([]);
        });
    });
});
