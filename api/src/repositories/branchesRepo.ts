/**
 * @fileoverview Repository for managing branch data access operations.
 * 
 * This module provides data access methods for branch entities in the OctoCAT supply chain system.
 * Branches represent regional distribution centers or local offices that belong to headquarters.
 * Each branch can place orders, manage inventory, and coordinate with suppliers.
 * 
 * The repository implements the standard CRUD operations plus specialized queries for:
 * - Finding branches by headquarters association
 * - Searching branches by name patterns
 * - Validating branch existence
 * 
 * @module repositories/branchesRepo
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Branch } from '../models/branch';
import { handleDatabaseError, NotFoundError } from '../utils/errors';
import { buildInsertSQL, buildUpdateSQL, objectToCamelCase, mapDatabaseRows, DatabaseRow } from '../utils/sql';

export class BranchesRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Retrieves all branches from the database.
   * 
   * Returns branches ordered by their unique identifier for consistent pagination
   * and display. This method is commonly used for admin dashboards and reporting.
   * 
   * @returns Promise resolving to an array of all branch records
   * @throws {DatabaseError} If the database query fails
   * 
   * @example
   * ```typescript
   * const repo = await createBranchesRepository();
   * const branches = await repo.findAll();
   * console.log(`Total branches: ${branches.length}`);
   * // Output: Total branches: 15
   * ```
   */
  async findAll(): Promise<Branch[]> {
    try {
      const rows = await this.db.all<DatabaseRow>('SELECT * FROM branches ORDER BY branch_id');
      return mapDatabaseRows<Branch>(rows);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Retrieves a single branch by its unique identifier.
   * 
   * This is the primary method for fetching branch details when you have the branch ID
   * from a URL parameter, relationship lookup, or stored reference.
   * 
   * @param id - The unique identifier of the branch to retrieve
   * @returns Promise resolving to the branch object if found, null otherwise
   * @throws {DatabaseError} If the database query fails
   * 
   * @example
   * ```typescript
   * const repo = await createBranchesRepository();
   * const branch = await repo.findById(5);
   * if (branch) {
   *   console.log(`Found: ${branch.name} in ${branch.city}`);
   *   // Output: Found: Seattle Distribution Center in Seattle
   * }
   * ```
   */
  async findById(id: number): Promise<Branch | null> {
    try {
      const row = await this.db.get<DatabaseRow>('SELECT * FROM branches WHERE branch_id = ?', [id]);
      return row ? objectToCamelCase<Branch>(row) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Creates a new branch in the database.
   * 
   * Inserts a new branch record with all required fields. The branch ID is auto-generated
   * by the database. After creation, the method fetches and returns the complete branch
   * object including the generated ID.
   * 
   * @param branch - Branch data without the branchId (auto-generated)
   * @returns Promise resolving to the newly created branch with generated ID
   * @throws {DatabaseError} If the database operation fails
   * @throws {ValidationError} If required fields are missing or invalid
   * 
   * @example
   * ```typescript
   * const repo = await createBranchesRepository();
   * const newBranch = await repo.create({
   *   headquartersId: 1,
   *   name: 'Portland Distribution Hub',
   *   address: '456 Industrial Way',
   *   city: 'Portland',
   *   state: 'OR',
   *   zipCode: '97201',
   *   phone: '503-555-0199',
   *   email: 'portland@octocat.com'
   * });
   * console.log(`Created branch with ID: ${newBranch.branchId}`);
   * ```
   */
  async create(branch: Omit<Branch, 'branchId'>): Promise<Branch> {
    try {
      const { sql, values } = buildInsertSQL('branches', branch);
      const result = await this.db.run(sql, values);

      const createdBranch = await this.findById(result.lastID || 0);
      if (!createdBranch) {
        throw new Error('Failed to retrieve created branch');
      }

      return createdBranch;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Updates an existing branch with partial data.
   * 
   * Allows updating specific fields of a branch without requiring all fields.
   * Only the provided fields will be updated; others remain unchanged. The branch ID
   * cannot be modified.
   * 
   * @param id - The unique identifier of the branch to update
   * @param branch - Partial branch data containing only the fields to update
   * @returns Promise resolving to the updated branch object
   * @throws {NotFoundError} If no branch exists with the given ID
   * @throws {DatabaseError} If the database operation fails
   * @throws {ValidationError} If update data contains invalid values
   * 
   * @example
   * ```typescript
   * const repo = await createBranchesRepository();
   * const updated = await repo.update(5, {
   *   phone: '206-555-0200',
   *   email: 'seattle.updated@octocat.com'
   * });
   * console.log(`Updated contact info for ${updated.name}`);
   * ```
   */
  async update(id: number, branch: Partial<Omit<Branch, 'branchId'>>): Promise<Branch> {
    try {
      const { sql, values } = buildUpdateSQL('branches', branch, 'branch_id = ?');
      const result = await this.db.run(sql, [...values, id]);

      if (result.changes === 0) {
        throw new NotFoundError('Branch', id);
      }

      const updatedBranch = await this.findById(id);
      if (!updatedBranch) {
        throw new Error('Failed to retrieve updated branch');
      }

      return updatedBranch;
    } catch (error) {
      handleDatabaseError(error, 'Branch', id);
    }
  }

  /**
   * Deletes a branch from the database.
   * 
   * Permanently removes the branch record. Note that this may fail if the branch
   * has related records (orders, etc.) due to foreign key constraints. Consider
   * implementing soft deletes for production use.
   * 
   * @param id - The unique identifier of the branch to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {NotFoundError} If no branch exists with the given ID
   * @throws {DatabaseError} If the deletion fails (e.g., foreign key constraint)
   * 
   * @example
   * ```typescript
   * const repo = await createBranchesRepository();
   * await repo.delete(99);
   * console.log('Branch deleted successfully');
   * ```
   */
  async delete(id: number): Promise<void> {
    try {
      const result = await this.db.run('DELETE FROM branches WHERE branch_id = ?', [id]);

      if (result.changes === 0) {
        throw new NotFoundError('Branch', id);
      }
    } catch (error) {
      handleDatabaseError(error, 'Branch', id);
    }
  }

  /**
   * Checks whether a branch exists in the database.
   * 
   * Efficient existence check using COUNT query. Useful for validation before
   * performing operations or establishing relationships.
   * 
   * @param id - The unique identifier of the branch to check
   * @returns Promise resolving to true if branch exists, false otherwise
   * @throws {DatabaseError} If the database query fails
   * 
   * @example
   * ```typescript
   * const repo = await createBranchesRepository();
   * const branchExists = await repo.exists(5);
   * if (!branchExists) {
   *   console.log('Branch not found, cannot create order');
   * }
   * ```
   */
  async exists(id: number): Promise<boolean> {
    try {
      const result = await this.db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM branches WHERE branch_id = ?',
        [id],
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Retrieves all branches belonging to a specific headquarters.
   * 
   * Returns branches ordered alphabetically by name. This method is essential for
   * displaying organizational hierarchy and managing multi-location operations.
   * 
   * @param headquartersId - The unique identifier of the headquarters
   * @returns Promise resolving to an array of branches under the headquarters
   * @throws {DatabaseError} If the database query fails
   * 
   * @example
   * ```typescript
   * const repo = await createBranchesRepository();
   * const westCoastBranches = await repo.findByHeadquartersId(1);
   * console.log(`West Coast HQ has ${westCoastBranches.length} branches`);
   * westCoastBranches.forEach(b => console.log(`- ${b.name}`));
   * // Output:
   * // - Portland Distribution Hub
   * // - Seattle Distribution Center
   * ```
   */
  async findByHeadquartersId(headquartersId: number): Promise<Branch[]> {
    try {
      const rows = await this.db.all<DatabaseRow>(
        'SELECT * FROM branches WHERE headquarters_id = ? ORDER BY name',
        [headquartersId],
      );
      return mapDatabaseRows<Branch>(rows);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Searches for branches by name using partial matching.
   * 
   * Performs a case-insensitive LIKE query to find branches whose names contain
   * the search term. Results are ordered alphabetically. Useful for autocomplete,
   * search features, and filtering.
   * 
   * @param name - Search term to match against branch names (case-insensitive)
   * @returns Promise resolving to an array of matching branches
   * @throws {DatabaseError} If the database query fails
   * 
   * @example
   * ```typescript
   * const repo = await createBranchesRepository();
   * const distributionCenters = await repo.findByName('Distribution');
   * console.log(`Found ${distributionCenters.length} distribution centers`);
   * // Matches: 'Seattle Distribution Center', 'Portland Distribution Hub', etc.
   * ```
   */
  async findByName(name: string): Promise<Branch[]> {
    try {
      const rows = await this.db.all<DatabaseRow>(
        'SELECT * FROM branches WHERE name LIKE ? ORDER BY name',
        [`%${name}%`],
      );
      return mapDatabaseRows<Branch>(rows);
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

/**
 * Factory function to create a new BranchesRepository instance.
 * 
 * Creates a repository connected to the appropriate database (production or test).
 * Each call creates a new instance; use this when you need isolated repository instances.
 * 
 * @param isTest - Whether to use the test database (default: false)
 * @returns Promise resolving to a new BranchesRepository instance
 * 
 * @example
 * ```typescript
 * // Production usage
 * const repo = await createBranchesRepository();
 * 
 * // Test usage
 * const testRepo = await createBranchesRepository(true);
 * ```
 */
export async function createBranchesRepository(
  isTest: boolean = false,
): Promise<BranchesRepository> {
  const db = await getDatabase(isTest);
  return new BranchesRepository(db);
}

// Singleton instance for default usage
let branchesRepo: BranchesRepository | null = null;

export async function getBranchesRepository(isTest: boolean = false): Promise<BranchesRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    // In tests, always return a fresh repository bound to the current in-memory DB
    return createBranchesRepository(true);
  }
  if (!branchesRepo) {
    branchesRepo = await createBranchesRepository(false);
  }
  return branchesRepo;
}
