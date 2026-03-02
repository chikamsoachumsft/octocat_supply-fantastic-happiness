/**
 * Repository for suppliers data access.
 * 
 * Provides CRUD operations and query methods for managing supplier records in the database.
 * Uses SQLite as the underlying database with automatic snake_case to camelCase conversion.
 * 
 * @module SuppliersRepository
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
   * Retrieves all suppliers from the database ordered by supplier ID.
   * 
   * @returns Promise resolving to array of Supplier objects
   * @throws {DatabaseError} When database query fails
   * 
   * @example
   * const repo = await getSuppliersRepository();
   * const suppliers = await repo.findAll();
   * console.log(`Found ${suppliers.length} suppliers`);
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
   * Retrieves a single supplier by their unique identifier.
   * 
   * @param id - The unique supplier ID to search for
   * @returns Promise resolving to Supplier object if found, null otherwise
   * @throws {DatabaseError} When database query fails
   * 
   * @example
   * const repo = await getSuppliersRepository();
   * const supplier = await repo.findById(123);
   * if (supplier) {
   *   console.log(`Found: ${supplier.name}`);
   * }
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
   * Converts SQLite integer fields (0/1) to JavaScript booleans for active and verified status.
   * SQLite stores booleans as integers, so this method ensures type consistency.
   * 
   * @param supplier - The supplier object with integer boolean fields
   * @returns Supplier object with proper boolean types
   * @internal
   */
  private convertBooleanFields(supplier: Supplier): Supplier {
    return {
      ...supplier,
      active: Boolean(supplier.active),
      verified: Boolean(supplier.verified),
    };
  }

  /**
   * Creates a new supplier record in the database.
   * 
   * @param supplier - Supplier data without supplierId (auto-generated)
   * @returns Promise resolving to the newly created Supplier with generated ID
   * @throws {DatabaseError} When database insert fails
   * @throws {ValidationError} When supplier data is invalid
   * 
   * @example
   * const repo = await getSuppliersRepository();
   * const newSupplier = await repo.create({
   *   name: 'Acme Corp',
   *   contactEmail: 'contact@acme.com',
   *   active: true,
   *   verified: false
   * });
   * console.log(`Created supplier with ID: ${newSupplier.supplierId}`);
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
   * Updates an existing supplier's information by ID.
   * 
   * @param id - The unique supplier ID to update
   * @param supplier - Partial supplier data to update (only changed fields needed)
   * @returns Promise resolving to the updated Supplier object
   * @throws {NotFoundError} When supplier with given ID doesn't exist
   * @throws {DatabaseError} When database update fails
   * 
   * @example
   * const repo = await getSuppliersRepository();
   * const updated = await repo.update(123, {
   *   contactEmail: 'newemail@acme.com',
   *   verified: true
   * });
   * console.log(`Updated supplier: ${updated.name}`);
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
   * Permanently deletes a supplier record from the database.
   * 
   * @param id - The unique supplier ID to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {NotFoundError} When supplier with given ID doesn't exist
   * @throws {DatabaseError} When database deletion fails
   * 
   * @example
   * const repo = await getSuppliersRepository();
   * await repo.delete(123);
   * console.log('Supplier deleted successfully');
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
   * Checks whether a supplier exists in the database.
   * 
   * @param id - The unique supplier ID to check
   * @returns Promise resolving to true if supplier exists, false otherwise
   * @throws {DatabaseError} When database query fails
   * 
   * @example
   * const repo = await getSuppliersRepository();
   * const exists = await repo.exists(123);
   * if (exists) {
   *   console.log('Supplier found');
   * }
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
   * Searches for suppliers by name using partial string matching.
   * Uses SQL LIKE operator for case-insensitive partial matches.
   * 
   * @param name - Partial or full supplier name to search for
   * @returns Promise resolving to array of matching Supplier objects, ordered by name
   * @throws {DatabaseError} When database query fails
   * 
   * @example
   * const repo = await getSuppliersRepository();
   * const results = await repo.findByName('Acme');
   * // Returns all suppliers with 'Acme' in their name
   * results.forEach(s => console.log(s.name));
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

/**
 * Factory function to create a new SuppliersRepository instance.
 * 
 * @param isTest - Whether to use test database (default: false)
 * @returns Promise resolving to new SuppliersRepository instance
 * 
 * @example
 * const repo = await createSuppliersRepository();
 * const suppliers = await repo.findAll();
 */
export async function createSuppliersRepository(
  isTest: boolean = false,
): Promise<SuppliersRepository> {
  const db = await getDatabase(isTest);
  return new SuppliersRepository(db);
}

/** Singleton instance for default usage */
let suppliersRepo: SuppliersRepository | null = null;

/**
 * Gets or creates a singleton SuppliersRepository instance.
 * In test environments, always creates a new instance with test database.
 * In production, returns cached singleton instance.
 * 
 * @param isTest - Whether to use test database (default: false)
 * @returns Promise resolving to SuppliersRepository instance
 * 
 * @example
 * // In production code
 * const repo = await getSuppliersRepository();
 * 
 * @example
 * // In test code
 * const testRepo = await getSuppliersRepository(true);
 */
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
