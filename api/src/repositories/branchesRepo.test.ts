import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BranchesRepository } from '../repositories/branchesRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
    getDatabase: vi.fn()
}));

import { getDatabase } from '../db/sqlite';

describe('BranchesRepository', () => {
    let repository: BranchesRepository;
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

        repository = new BranchesRepository(mockDb);
        vi.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all branches', async () => {
            const mockRows = [
                { branch_id: 1, headquarters_id: 1, name: 'Branch A', description: 'Desc A', address: '1 Main St', contact_person: 'Alice', email: 'a@test.com', phone: '555-0001' },
                { branch_id: 2, headquarters_id: 1, name: 'Branch B', description: 'Desc B', address: '2 Main St', contact_person: 'Bob', email: 'b@test.com', phone: '555-0002' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findAll();

            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM branches ORDER BY branch_id');
            expect(result).toHaveLength(2);
            expect(result[0].branchId).toBe(1);
            expect(result[0].name).toBe('Branch A');
        });

        it('should return empty array when no branches exist', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return branch when found', async () => {
            const mockRow = { branch_id: 1, headquarters_id: 1, name: 'Branch A', description: 'Desc A', address: '1 Main St', contact_person: 'Alice', email: 'a@test.com', phone: '555-0001' };
            mockDb.get.mockResolvedValue(mockRow);

            const result = await repository.findById(1);

            expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM branches WHERE branch_id = ?', [1]);
            expect(result?.branchId).toBe(1);
            expect(result?.name).toBe('Branch A');
        });

        it('should return null when branch not found', async () => {
            mockDb.get.mockResolvedValue(undefined);

            const result = await repository.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should insert a new branch and return it with generated branchId', async () => {
            const newBranch = {
                headquartersId: 1,
                name: 'New Branch',
                description: 'New Desc',
                address: '3 New St',
                contactPerson: 'Carol',
                email: 'c@test.com',
                phone: '555-0003'
            };

            mockDb.run.mockResolvedValue({ lastID: 3, changes: 1 });
            mockDb.get.mockResolvedValue({
                branch_id: 3,
                headquarters_id: 1,
                name: 'New Branch',
                description: 'New Desc',
                address: '3 New St',
                contact_person: 'Carol',
                email: 'c@test.com',
                phone: '555-0003'
            });

            const result = await repository.create(newBranch);

            expect(mockDb.run).toHaveBeenCalled();
            expect(result.branchId).toBe(3);
            expect(result.name).toBe('New Branch');
        });
    });

    describe('update', () => {
        it('should update an existing branch and return updated data', async () => {
            const updateData = { name: 'Updated Branch' };

            mockDb.run.mockResolvedValue({ changes: 1 });
            mockDb.get.mockResolvedValue({
                branch_id: 1,
                headquarters_id: 1,
                name: 'Updated Branch',
                description: 'Desc A',
                address: '1 Main St',
                contact_person: 'Alice',
                email: 'a@test.com',
                phone: '555-0001'
            });

            const result = await repository.update(1, updateData);

            expect(result.name).toBe('Updated Branch');
        });

        it('should throw NotFoundError when branch does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });

            await expect(repository.update(999, { name: 'x' })).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete an existing branch', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 });

            await repository.delete(1);

            expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM branches WHERE branch_id = ?', [1]);
        });

        it('should throw NotFoundError when branch does not exist', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 });

            await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('exists', () => {
        it('should return true when branch exists', async () => {
            mockDb.get.mockResolvedValue({ count: 1 });

            const result = await repository.exists(1);

            expect(result).toBe(true);
            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM branches WHERE branch_id = ?',
                [1]
            );
        });

        it('should return false when branch does not exist', async () => {
            mockDb.get.mockResolvedValue({ count: 0 });

            const result = await repository.exists(999);

            expect(result).toBe(false);
        });
    });

    describe('findByHeadquartersId', () => {
        it('should return branches for a given headquarters', async () => {
            const mockRows = [
                { branch_id: 1, headquarters_id: 2, name: 'Branch A', description: '', address: '', contact_person: '', email: '', phone: '' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findByHeadquartersId(2);

            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM branches WHERE headquarters_id = ? ORDER BY name',
                [2]
            );
            expect(result).toHaveLength(1);
            expect(result[0].headquartersId).toBe(2);
        });

        it('should return empty array for unknown headquarters', async () => {
            mockDb.all.mockResolvedValue([]);

            const result = await repository.findByHeadquartersId(999);

            expect(result).toEqual([]);
        });
    });

    describe('findByName', () => {
        it('should return branches matching name pattern', async () => {
            const mockRows = [
                { branch_id: 1, headquarters_id: 1, name: 'East Branch', description: '', address: '', contact_person: '', email: '', phone: '' }
            ];
            mockDb.all.mockResolvedValue(mockRows);

            const result = await repository.findByName('East');

            expect(mockDb.all).toHaveBeenCalledWith(
                'SELECT * FROM branches WHERE name LIKE ? ORDER BY name',
                ['%East%']
            );
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('East Branch');
        });
    });
});
