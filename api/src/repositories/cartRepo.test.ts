import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { CartRepository } from './cartRepo';

describe('CartRepository', () => {
  let cartRepo: CartRepository;

  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    const db = await getDatabase(true);

    // Create tables directly (for testing without full migrations)
    await db.run(`
      CREATE TABLE IF NOT EXISTS suppliers (
        supplier_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS products (
        product_id INTEGER PRIMARY KEY,
        supplier_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        sku TEXT NOT NULL,
        unit TEXT NOT NULL,
        img_name TEXT,
        discount REAL DEFAULT 0.0,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS carts (
        cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        cart_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        added_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        UNIQUE (cart_id, product_id)
      )
    `);

    // Create test data
    await db.run(
      `INSERT INTO suppliers (supplier_id, name, description) VALUES (1, 'Test Supplier', 'Test')`,
    );
    await db.run(
      `INSERT INTO products (product_id, supplier_id, name, description, price, sku, unit, img_name) 
       VALUES (1, 1, 'Test Product 1', 'Description 1', 10.99, 'SKU1', 'unit', 'img1.jpg')`,
    );
    await db.run(
      `INSERT INTO products (product_id, supplier_id, name, description, price, sku, unit, img_name) 
       VALUES (2, 1, 'Test Product 2', 'Description 2', 20.99, 'SKU2', 'unit', 'img2.jpg')`,
    );

    cartRepo = new CartRepository(db);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('getOrCreateCart', () => {
    it('should create a new cart for a user', async () => {
      const cart = await cartRepo.getOrCreateCart('user123');

      expect(cart).toBeDefined();
      expect(cart.userId).toBe('user123');
      expect(cart.cartId).toBeDefined();
      expect(cart.createdAt).toBeDefined();
      expect(cart.updatedAt).toBeDefined();
    });

    it('should return existing cart for a user', async () => {
      const cart1 = await cartRepo.getOrCreateCart('user123');
      const cart2 = await cartRepo.getOrCreateCart('user123');

      expect(cart1.cartId).toBe(cart2.cartId);
    });
  });

  describe('getCartWithItems', () => {
    it('should return empty cart for new user', async () => {
      const cart = await cartRepo.getCartWithItems('user123');

      expect(cart).toBeDefined();
      expect(cart.userId).toBe('user123');
      expect(cart.items).toEqual([]);
    });

    it('should return cart with items', async () => {
      await cartRepo.addItem('user123', 1, 2);
      await cartRepo.addItem('user123', 2, 1);

      const cart = await cartRepo.getCartWithItems('user123');

      expect(cart.items).toHaveLength(2);
      expect(cart.items[0].productId).toBeDefined();
      expect(cart.items[0].productName).toBeDefined();
      expect(cart.items[0].productPrice).toBeDefined();
      expect(cart.items[0].quantity).toBeDefined();
    });
  });

  describe('addItem', () => {
    it('should add a new item to cart', async () => {
      const cartItem = await cartRepo.addItem('user123', 1, 2);

      expect(cartItem).toBeDefined();
      expect(cartItem.productId).toBe(1);
      expect(cartItem.quantity).toBe(2);
    });

    it('should update quantity if item already exists', async () => {
      await cartRepo.addItem('user123', 1, 2);
      const cartItem = await cartRepo.addItem('user123', 1, 3);

      expect(cartItem.quantity).toBe(5);
    });

    it('should throw error for invalid quantity', async () => {
      await expect(cartRepo.addItem('user123', 1, 0)).rejects.toThrow();
      await expect(cartRepo.addItem('user123', 1, -1)).rejects.toThrow();
    });
  });

  describe('updateItemQuantity', () => {
    it('should update cart item quantity', async () => {
      const addedItem = await cartRepo.addItem('user123', 1, 2);
      const updatedItem = await cartRepo.updateItemQuantity('user123', addedItem.cartItemId, 5);

      expect(updatedItem.quantity).toBe(5);
    });

    it('should throw error for non-existent item', async () => {
      await expect(cartRepo.updateItemQuantity('user123', 99999, 5)).rejects.toThrow();
    });

    it('should throw error for invalid quantity', async () => {
      const addedItem = await cartRepo.addItem('user123', 1, 2);

      await expect(
        cartRepo.updateItemQuantity('user123', addedItem.cartItemId, 0),
      ).rejects.toThrow();
      await expect(
        cartRepo.updateItemQuantity('user123', addedItem.cartItemId, -1),
      ).rejects.toThrow();
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const addedItem = await cartRepo.addItem('user123', 1, 2);

      await cartRepo.removeItem('user123', addedItem.cartItemId);

      const cart = await cartRepo.getCartWithItems('user123');
      expect(cart.items).toHaveLength(0);
    });

    it('should throw error for non-existent item', async () => {
      await expect(cartRepo.removeItem('user123', 99999)).rejects.toThrow();
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', async () => {
      await cartRepo.addItem('user123', 1, 2);
      await cartRepo.addItem('user123', 2, 1);

      await cartRepo.clearCart('user123');

      const cart = await cartRepo.getCartWithItems('user123');
      expect(cart.items).toHaveLength(0);
    });
  });
});
