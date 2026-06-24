import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProductsRepository } from './productsRepo';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { NotFoundError } from '../utils/errors';

describe('ProductsRepository — stock methods', () => {
  let repo: ProductsRepository;

  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    const db = await getDatabase();
    // Seed a supplier required by the products FK
    await db.run('INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)', [1, 'Test Supplier']);

    repo = new ProductsRepository(db);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  // ---------------------------------------------------------------------------
  // checkStock
  // ---------------------------------------------------------------------------
  describe('checkStock', () => {
    it('should return true when the product has sufficient stock', async () => {
      const db = await getDatabase();
      await db.run(
        'INSERT INTO products (product_id, supplier_id, name, price, sku, unit, stock_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, 1, 'Widget', 9.99, 'W-001', 'each', 10],
      );

      const result = await repo.checkStock(1, 5);

      expect(result).toBe(true);
    });

    it('should return true when requested quantity equals available stock exactly', async () => {
      const db = await getDatabase();
      await db.run(
        'INSERT INTO products (product_id, supplier_id, name, price, sku, unit, stock_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, 1, 'Widget', 9.99, 'W-001', 'each', 10],
      );

      const result = await repo.checkStock(1, 10);

      expect(result).toBe(true);
    });

    it('should return false when the product has insufficient stock', async () => {
      const db = await getDatabase();
      await db.run(
        'INSERT INTO products (product_id, supplier_id, name, price, sku, unit, stock_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, 1, 'Widget', 9.99, 'W-001', 'each', 3],
      );

      const result = await repo.checkStock(1, 5);

      expect(result).toBe(false);
    });

    it('should throw NotFoundError when the product does not exist', async () => {
      await expect(repo.checkStock(999, 1)).rejects.toThrow(NotFoundError);
    });
  });

  // ---------------------------------------------------------------------------
  // decrementStock
  // ---------------------------------------------------------------------------
  describe('decrementStock', () => {
    it('should reduce stock by the exact quantity requested', async () => {
      const db = await getDatabase();
      await db.run(
        'INSERT INTO products (product_id, supplier_id, name, price, sku, unit, stock_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, 1, 'Widget', 9.99, 'W-001', 'each', 10],
      );

      await repo.decrementStock(1, 3);

      const row = await db.get<{ stock_level: number }>(
        'SELECT stock_level FROM products WHERE product_id = 1',
      );
      expect(row?.stock_level).toBe(7);
    });

    it('should allow stock to reach exactly 0 (boundary condition)', async () => {
      const db = await getDatabase();
      await db.run(
        'INSERT INTO products (product_id, supplier_id, name, price, sku, unit, stock_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, 1, 'Widget', 9.99, 'W-001', 'each', 5],
      );

      await repo.decrementStock(1, 5);

      const row = await db.get<{ stock_level: number }>(
        'SELECT stock_level FROM products WHERE product_id = 1',
      );
      expect(row?.stock_level).toBe(0);
    });

    it('should throw an error containing the product name when stock is insufficient', async () => {
      const db = await getDatabase();
      await db.run(
        'INSERT INTO products (product_id, supplier_id, name, price, sku, unit, stock_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, 1, 'Fancy Widget', 9.99, 'W-001', 'each', 2],
      );

      await expect(repo.decrementStock(1, 5)).rejects.toThrow(/Fancy Widget/);
    });

    it('should throw NotFoundError when the product does not exist', async () => {
      await expect(repo.decrementStock(999, 1)).rejects.toThrow(NotFoundError);
    });
  });
});
