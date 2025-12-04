import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CartRepository } from './cartRepo';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { NotFoundError } from '../utils/errors';

describe('CartRepository', () => {
  let repository: CartRepository;

  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    const db = await getDatabase(true);
    await runMigrations(true);

    // Seed required data: supplier and product
    await db.run('INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)', [1, 'Test Supplier']);
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, description, price, sku, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 'Test Product', 'Test Description', 99.99, 'TEST-001', 'piece']
    );

    repository = new CartRepository(db);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('getCartBySessionId', () => {
    it('should return cart when found', async () => {
      const sessionId = 'test-session-123';
      await repository.createCart(sessionId);

      const result = await repository.getCartBySessionId(sessionId);

      expect(result).not.toBeNull();
      expect(result?.sessionId).toBe(sessionId);
    });

    it('should return null when cart not found', async () => {
      const result = await repository.getCartBySessionId('non-existent-session');

      expect(result).toBeNull();
    });
  });

  describe('createCart', () => {
    it('should create a new cart', async () => {
      const sessionId = 'new-session-456';

      const cart = await repository.createCart(sessionId);

      expect(cart.sessionId).toBe(sessionId);
      expect(cart.cartId).toBeDefined();
      expect(cart.createdAt).toBeDefined();
      expect(cart.updatedAt).toBeDefined();
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', async () => {
      const sessionId = 'test-session-789';
      const cart = await repository.createCart(sessionId);

      const item = await repository.addItem(cart.cartId, 1, 3);

      expect(item.cartId).toBe(cart.cartId);
      expect(item.productId).toBe(1);
      expect(item.quantity).toBe(3);
    });

    it('should update quantity when adding existing product', async () => {
      const sessionId = 'test-session-abc';
      const cart = await repository.createCart(sessionId);

      // Add item first time
      await repository.addItem(cart.cartId, 1, 2);

      // Add same product again
      const item = await repository.addItem(cart.cartId, 1, 3);

      expect(item.quantity).toBe(5);

      // Verify only one item exists
      const items = await repository.getCartItems(cart.cartId);
      expect(items.length).toBe(1);
      expect(items[0].quantity).toBe(5);
    });
  });

  describe('getCartItems', () => {
    it('should return items with joined product data', async () => {
      const sessionId = 'test-session-def';
      const cart = await repository.createCart(sessionId);
      await repository.addItem(cart.cartId, 1, 2);

      const items = await repository.getCartItems(cart.cartId);

      expect(items.length).toBe(1);
      expect(items[0].quantity).toBe(2);
      expect(items[0].product).toBeDefined();
      expect(items[0].product.name).toBe('Test Product');
      expect(items[0].product.price).toBe(99.99);
    });

    it('should return empty array when cart has no items', async () => {
      const sessionId = 'test-session-ghi';
      const cart = await repository.createCart(sessionId);

      const items = await repository.getCartItems(cart.cartId);

      expect(items).toEqual([]);
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', async () => {
      const sessionId = 'test-session-jkl';
      const cart = await repository.createCart(sessionId);
      const item = await repository.addItem(cart.cartId, 1, 2);

      await repository.updateItemQuantity(item.cartItemId, 5);

      const items = await repository.getCartItems(cart.cartId);
      expect(items[0].quantity).toBe(5);
    });

    it('should throw NotFoundError when item not found', async () => {
      await expect(repository.updateItemQuantity(999, 5)).rejects.toThrow(NotFoundError);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const sessionId = 'test-session-mno';
      const cart = await repository.createCart(sessionId);
      const item = await repository.addItem(cart.cartId, 1, 2);

      await repository.removeItem(item.cartItemId);

      const items = await repository.getCartItems(cart.cartId);
      expect(items.length).toBe(0);
    });

    it('should throw NotFoundError when item not found', async () => {
      await expect(repository.removeItem(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', async () => {
      const sessionId = 'test-session-pqr';
      const cart = await repository.createCart(sessionId);
      await repository.addItem(cart.cartId, 1, 2);

      await repository.clearCart(cart.cartId);

      const items = await repository.getCartItems(cart.cartId);
      expect(items.length).toBe(0);
    });
  });

  describe('touchCart', () => {
    it('should update cart timestamp', async () => {
      const sessionId = 'test-session-stu';
      const cart = await repository.createCart(sessionId);
      const originalUpdatedAt = cart.updatedAt;

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await repository.touchCart(cart.cartId);

      const updatedCart = await repository.getCartBySessionId(sessionId);
      expect(updatedCart?.updatedAt).not.toBe(originalUpdatedAt);
    });
  });
});
