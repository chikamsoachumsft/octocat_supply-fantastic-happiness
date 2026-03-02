/**
 * Repository for suppliers data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Supplier } from '../models/supplier';
import { handleDatabaseError, NotFoundError } from '../utils/errors';
import { buildInsertSQL, buildUpdateSQL, objectToCamelCase, mapDatabaseRows, DatabaseRow } from '../utils/sql';

/** Aggregate supplier counts returned by {@link SuppliersRepository.getStats}. */
export interface SupplierStats {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  pendingVerification: number;
}

export class SuppliersRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Get all suppliers
   */
  async findAll(): Promise<Supplier[]> {
    try {
      const rows = await this.db.all<DatabaseRow>('SELECT * FROM suppliers ORDER BY supplier_id');
      return mapDatabaseRows<Supplier>(rows).map(this.convertBooleanFields);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get supplier by ID
   */
  async findById(id: number): Promise<Supplier | null> {
    try {
      const row = await this.db.get<DatabaseRow>('SELECT * FROM suppliers WHERE supplier_id = ?', [id]);
      return row ? this.convertBooleanFields(objectToCamelCase<Supplier>(row)) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Convert integer fields to boolean for SQLite compatibility
   */
  private convertBooleanFields(supplier: Supplier): Supplier {
    return {
      ...supplier,
      active: Boolean(supplier.active),
      verified: Boolean(supplier.verified),
    };
  }

  /**
   * Create a new supplier
   */
  async create(supplier: Omit<Supplier, 'supplierId'>): Promise<Supplier> {
    try {
      const { sql, values } = buildInsertSQL('suppliers', supplier);
      const result = await this.db.run(sql, values);

      const createdSupplier = await this.findById(result.lastID || 0);
      if (!createdSupplier) {
        throw new Error('Failed to retrieve created supplier');
      }

      return createdSupplier;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update supplier by ID
   */
  async update(id: number, supplier: Partial<Omit<Supplier, 'supplierId'>>): Promise<Supplier> {
    try {
      const { sql, values } = buildUpdateSQL('suppliers', supplier, 'supplier_id = ?');
      const result = await this.db.run(sql, [...values, id]);

      if (result.changes === 0) {
        throw new NotFoundError('Supplier', id);
      }

      const updatedSupplier = await this.findById(id);
      if (!updatedSupplier) {
        throw new Error('Failed to retrieve updated supplier');
      }

      return updatedSupplier;
    } catch (error) {
      handleDatabaseError(error, 'Supplier', id);
    }
  }

  /**
   * Delete supplier by ID
   */
  async delete(id: number): Promise<void> {
    try {
      const result = await this.db.run('DELETE FROM suppliers WHERE supplier_id = ?', [id]);

      if (result.changes === 0) {
        throw new NotFoundError('Supplier', id);
      }
    } catch (error) {
      handleDatabaseError(error, 'Supplier', id);
    }
  }

  /**
   * Check if supplier exists
   */
  async exists(id: number): Promise<boolean> {
    try {
      const result = await this.db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM suppliers WHERE supplier_id = ?',
        [id],
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find suppliers by name (partial match)
   */
  async findByName(name: string): Promise<Supplier[]> {
    try {
      const rows = await this.db.all<DatabaseRow>(
        'SELECT * FROM suppliers WHERE name LIKE ? ORDER BY name',
        [`%${name}%`],
      );
      return mapDatabaseRows<Supplier>(rows);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Returns aggregate statistics for all suppliers.
   *
   * @returns Promise resolving to a {@link SupplierStats} object with counts
   * @throws {DatabaseError} When database query fails
   *
   * @example
   * const repo = await getSuppliersRepository();
   * const stats = await repo.getStats();
   * console.log(`Total suppliers: ${stats.total}, Active: ${stats.active}`);
   */
  async getStats(): Promise<SupplierStats> {
    try {
      const row = await this.db.get<DatabaseRow>(`
        SELECT
          COUNT(*)                                           AS total,
          SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END)      AS active,
          SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END)      AS inactive,
          SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END)    AS verified,
          SUM(CASE WHEN verified = 0 THEN 1 ELSE 0 END)    AS pending_verification
        FROM suppliers
      `);
      return {
        total: Number(row?.total ?? 0),
        active: Number(row?.active ?? 0),
        inactive: Number(row?.inactive ?? 0),
        verified: Number(row?.verified ?? 0),
        pendingVerification: Number(row?.pending_verification ?? 0),
      };
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function to create repository instance
export async function createSuppliersRepository(
  isTest: boolean = false,
): Promise<SuppliersRepository> {
  const db = await getDatabase(isTest);
  return new SuppliersRepository(db);
}

// Singleton instance for default usage
let suppliersRepo: SuppliersRepository | null = null;

export async function getSuppliersRepository(
  isTest: boolean = false,
): Promise<SuppliersRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    return createSuppliersRepository(true);
  }
  if (!suppliersRepo) {
    suppliersRepo = await createSuppliersRepository(false);
  }
  return suppliersRepo;
}
