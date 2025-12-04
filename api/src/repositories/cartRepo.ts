/**
 * Repository for cart data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Cart, CartItem, CartWithItems, CartItemWithProduct } from '../models/cart';
import { handleDatabaseError, NotFoundError, ValidationError } from '../utils/errors';
import {
  buildInsertSQL,
  objectToCamelCase,
  mapDatabaseRows,
  DatabaseRow,
} from '../utils/sql';

export class CartRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Get or create a cart for a user
   */
  async getOrCreateCart(userId: string): Promise<Cart> {
    try {
      // Try to find existing cart
      const existingCart = await this.db.get<DatabaseRow>(
        'SELECT * FROM carts WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId],
      );

      if (existingCart) {
        return objectToCamelCase<Cart>(existingCart);
      }

      // Create new cart
      const cart = { userId };
      const { sql, values } = buildInsertSQL('carts', cart);
      const result = await this.db.run(sql, values);

      const createdCart = await this.findById(result.lastID || 0);
      if (!createdCart) {
        throw new Error('Failed to retrieve created cart');
      }

      return createdCart;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get cart by ID
   */
  async findById(id: number): Promise<Cart | null> {
    try {
      const row = await this.db.get<DatabaseRow>('SELECT * FROM carts WHERE cart_id = ?', [id]);
      return row ? objectToCamelCase<Cart>(row) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get cart with items and product details
   */
  async getCartWithItems(userId: string): Promise<CartWithItems> {
    try {
      const cart = await this.getOrCreateCart(userId);

      // Fetch cart items with product details using a JOIN query
      const rows = await this.db.all<DatabaseRow>(
        `SELECT 
          ci.cart_item_id,
          ci.cart_id,
          ci.product_id,
          ci.quantity,
          ci.added_at,
          p.name as product_name,
          p.price as product_price,
          p.img_name as product_img_name,
          p.discount as product_discount
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.product_id
        WHERE ci.cart_id = ?
        ORDER BY ci.added_at DESC`,
        [cart.cartId],
      );

      const items = mapDatabaseRows<CartItemWithProduct>(rows);

      return {
        ...cart,
        items,
      };
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Add item to cart or update quantity if it already exists
   */
  async addItem(userId: string, productId: number, quantity: number): Promise<CartItem> {
    try {
      if (quantity <= 0) {
        throw new ValidationError('Quantity must be greater than 0');
      }

      const cart = await this.getOrCreateCart(userId);

      // Check if item already exists in cart
      const existingItem = await this.db.get<DatabaseRow>(
        'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
        [cart.cartId, productId],
      );

      if (existingItem) {
        // Update quantity
        const newQuantity = (existingItem.quantity as number) + quantity;
        const result = await this.db.run(
          'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
          [newQuantity, existingItem.cart_item_id],
        );

        if (result.changes === 0) {
          throw new Error('Failed to update cart item');
        }

        // Update cart's updated_at timestamp
        await this.db.run("UPDATE carts SET updated_at = datetime('now') WHERE cart_id = ?", [
          cart.cartId,
        ]);

        const updatedItem = await this.db.get<DatabaseRow>(
          'SELECT * FROM cart_items WHERE cart_item_id = ?',
          [existingItem.cart_item_id],
        );

        if (!updatedItem) {
          throw new Error('Failed to retrieve updated cart item');
        }

        return objectToCamelCase<CartItem>(updatedItem);
      }

      // Add new item
      const cartItem = {
        cartId: cart.cartId,
        productId,
        quantity,
      };

      const { sql, values } = buildInsertSQL('cart_items', cartItem);
      const result = await this.db.run(sql, values);

      // Update cart's updated_at timestamp
      await this.db.run(`UPDATE carts SET updated_at = datetime('now') WHERE cart_id = ?`, [
        cart.cartId,
      ]);

      const createdItem = await this.db.get<DatabaseRow>(
        'SELECT * FROM cart_items WHERE cart_item_id = ?',
        [result.lastID],
      );

      if (!createdItem) {
        throw new Error('Failed to retrieve created cart item');
      }

      return objectToCamelCase<CartItem>(createdItem);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(
    userId: string,
    cartItemId: number,
    quantity: number,
  ): Promise<CartItem> {
    try {
      if (quantity <= 0) {
        throw new ValidationError('Quantity must be greater than 0');
      }

      const cart = await this.getOrCreateCart(userId);

      // Verify the cart item belongs to this user's cart
      const existingItem = await this.db.get<DatabaseRow>(
        'SELECT * FROM cart_items WHERE cart_item_id = ? AND cart_id = ?',
        [cartItemId, cart.cartId],
      );

      if (!existingItem) {
        throw new NotFoundError('CartItem', cartItemId);
      }

      const result = await this.db.run(
        'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
        [quantity, cartItemId],
      );

      if (result.changes === 0) {
        throw new Error('Failed to update cart item');
      }

      // Update cart's updated_at timestamp
      await this.db.run(`UPDATE carts SET updated_at = datetime('now') WHERE cart_id = ?`, [
        cart.cartId,
      ]);

      const updatedItem = await this.db.get<DatabaseRow>(
        'SELECT * FROM cart_items WHERE cart_item_id = ?',
        [cartItemId],
      );

      if (!updatedItem) {
        throw new Error('Failed to retrieve updated cart item');
      }

      return objectToCamelCase<CartItem>(updatedItem);
    } catch (error) {
      handleDatabaseError(error, 'CartItem', cartItemId);
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, cartItemId: number): Promise<void> {
    try {
      const cart = await this.getOrCreateCart(userId);

      // Verify the cart item belongs to this user's cart
      const existingItem = await this.db.get<DatabaseRow>(
        'SELECT * FROM cart_items WHERE cart_item_id = ? AND cart_id = ?',
        [cartItemId, cart.cartId],
      );

      if (!existingItem) {
        throw new NotFoundError('CartItem', cartItemId);
      }

      const result = await this.db.run('DELETE FROM cart_items WHERE cart_item_id = ?', [
        cartItemId,
      ]);

      if (result.changes === 0) {
        throw new NotFoundError('CartItem', cartItemId);
      }

      // Update cart's updated_at timestamp
      await this.db.run(`UPDATE carts SET updated_at = datetime('now') WHERE cart_id = ?`, [
        cart.cartId,
      ]);
    } catch (error) {
      handleDatabaseError(error, 'CartItem', cartItemId);
    }
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId: string): Promise<void> {
    try {
      const cart = await this.getOrCreateCart(userId);

      await this.db.run('DELETE FROM cart_items WHERE cart_id = ?', [cart.cartId]);

      // Update cart's updated_at timestamp
      await this.db.run(`UPDATE carts SET updated_at = datetime('now') WHERE cart_id = ?`, [
        cart.cartId,
      ]);
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function to create repository instance
export async function createCartRepository(isTest: boolean = false): Promise<CartRepository> {
  const db = await getDatabase(isTest);
  return new CartRepository(db);
}

// Singleton for non-test environments
let cartRepoInstance: CartRepository | null = null;

export async function getCartRepository(): Promise<CartRepository> {
  const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

  if (isTest) {
    // For tests, always create a new instance
    return createCartRepository(true);
  }

  // For non-test environments, use singleton pattern
  if (!cartRepoInstance) {
    cartRepoInstance = await createCartRepository(false);
  }
  return cartRepoInstance;
}
