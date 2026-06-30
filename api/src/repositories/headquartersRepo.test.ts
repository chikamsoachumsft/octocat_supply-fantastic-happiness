import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeadquartersRepository } from '../repositories/headquartersRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
    getDatabase: vi.fn()
}));

import { getDatabase } from '../db/sqlite';

describe('HeadquartersRepository', () => {
    let repository: HeadquartersRepository;
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

        repository = new HeadquartersRepository(mockDb);
        vi.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all headquarters records', async () => {
            const mockRows = [
                { headquarters_id: 1, name: 'HQ Alpha', description: 'Desc A', address: '1 Corp Ave', contact_person: 'Alice', email: 'a@corp.com', phone: '555-1001' },
                { headquarters_id: 2, name: 'HQ Beta', description: 'Desc B', address: '2 Corp Ave', contact_person: 'Bob', email: 'b@corp.com', phone: '555-1002' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findAll();

            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM headquarters ORDER BY headquarters_id');
            expect(result).toHaveLength(2);
            expect(result[0].headquartersId).toBe(1);
            expect(result[0].name).toBe('HQ Alpha');
        });

        it('should return empty array when no headquarters exist', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return headquarters when found', async () => {
            const mockRow = { headquarters_id: 1, name: 'HQ Alpha', description: 'Desc A', address: '1 Corp Ave', contact_person: 'Alice', email: 'a@corp.com', phone: '555-1001' };
            mockDb.get.mockResolvedValue(mockRow);

            const result = await repository.findById(1);

            expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM headquarters WHERE headquarters_id = ?', [1]);
            expect(result?.headquartersId).toBe(1);
            expect(result?.name).toBe('HQ Alpha');
        });

        it('should return null when headquarters not found', async () => {
            mockDb.get.mockResolvedValue(undefined);

            const result = await repository.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should insert a new headquarters and return it with generated headquartersId', async () => {
            const newHq = {
                name: 'HQ Gamma',
                description: 'New HQ',
                address: '3 Corp Ave',
                contactPerson: 'Carol',
                email: 'c@corp.com',
                phone: '555-1003'
            };

            mockDb.run.mockResolvedValue({ lastID: 3, changes: 1 });
            mockDb.get.mockResolvedValue({
                headquarters_id: 3,
                name: 'HQ Gamma',
                description: 'New HQ',
                address: '3 Corp Ave',
                contact_person: 'Carol',
                email: 'c@corp.com',
                phone: '555-1003'
            });

            const result = await repository.create(newHq);

            expect(mockDb.run).toHaveBeenCalled();
            expect(result.headquartersId).toBe(3);
            expect(result.name).toBe('HQ Gamma');
        });
    });

    describe('update', () => {
        it('should update an existing headquarters and return updated data', async () => {
            const updateData = { name: 'HQ Alpha Updated' };

            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({
                headquarters_id: 1,
                name: 'HQ Alpha Updated',
                description: 'Desc A',
                address: '1 Corp Ave',
                contact_person: 'Alice',
                email: 'a@corp.com',
                phone: '555-1001'
            });

            const result = await repository.update(1, updateData);

            expect(result.name).toBe('HQ Alpha Updated');
        });

        it('should throw NotFoundError when headquarters does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });

            await expect(repository.update(999, { name: 'x' })).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete an existing headquarters', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });

            await repository.delete(1);

            expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM headquarters WHERE headquarters_id = ?', [1]);
        });

        it('should throw NotFoundError when headquarters does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });

            await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('exists', () => {
        it('should return true when headquarters exists', async () => {
            mockDb.get.mockResolvedValue({ count: 1 });

            const result = await repository.exists(1);

            expect(result).toBe(true);
            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM headquarters WHERE headquarters_id = ?',
                [1]
            );
        });

        it('should return false when headquarters does not exist', async () => {
            mockDb.get.mockResolvedValue({ count: 0 });

            const result = await repository.exists(999);

            expect(result).toBe(false);
        });
    });

    describe('findByName', () => {
        it('should return headquarters matching name pattern', async () => {
            const mockRows = [
                { headquarters_id: 1, name: 'HQ Alpha', description: 'Desc A', address: '1 Corp Ave', contact_person: 'Alice', email: 'a@corp.com', phone: '555-1001' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findByName('Alpha');

            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM headquarters WHERE name LIKE ? ORDER BY name',
                ['%Alpha%']
            );
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('HQ Alpha');
        });

        it('should return empty array when no headquarters match name', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findByName('Nonexistent');

            expect(result).toEqual([]);
        });
    });
});
