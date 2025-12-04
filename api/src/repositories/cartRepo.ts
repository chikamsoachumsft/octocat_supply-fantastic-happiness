/**
 * Repository for cart data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Cart } from '../models/cart';
import { CartItem } from '../models/cartItem';
import { Product } from '../models/product';
import { handleDatabaseError, NotFoundError, ValidationError } from '../utils/errors';
import { buildInsertSQL, objectToCamelCase, DatabaseRow } from '../utils/sql';

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export class CartRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Get cart by session ID
   */
  async getCartBySessionId(sessionId: string): Promise<Cart | null> {
    try {
      const row = await this.db.get<DatabaseRow>(
        'SELECT * FROM carts WHERE session_id = ?',
        [sessionId],
      );
      return row ? objectToCamelCase<Cart>(row) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Create a new cart for a session
   */
  async createCart(sessionId: string): Promise<Cart> {
    try {
      const now = new Date().toISOString();
      const { sql, values } = buildInsertSQL('carts', {
        sessionId,
        createdAt: now,
        updatedAt: now,
      });
      
      const result = await this.db.run(sql, values);

      const createdCart = await this.getCartBySessionId(sessionId);
      if (!createdCart) {
        throw new Error('Failed to retrieve created cart');
      }

      return createdCart;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get all items in a cart with product details
   */
  async getCartItems(cartId: number): Promise<CartItemWithProduct[]> {
    try {
      const rows = await this.db.all<DatabaseRow>(
        `SELECT 
          ci.cart_item_id, ci.cart_id, ci.product_id, ci.quantity, ci.added_at,
          p.product_id as p_product_id, p.supplier_id, p.name, p.description, 
          p.price, p.sku, p.unit, p.img_name, p.discount
        FROM cart_items ci
        INNER JOIN products p ON ci.product_id = p.product_id
        WHERE ci.cart_id = ?
        ORDER BY ci.added_at DESC`,
        [cartId],
      );

      return rows.map(row => {
        const cartItem = objectToCamelCase<CartItem>({
          cart_item_id: row.cart_item_id,
          cart_id: row.cart_id,
          product_id: row.product_id,
          quantity: row.quantity,
          added_at: row.added_at,
        });

        const product = objectToCamelCase<Product>({
          product_id: row.p_product_id,
          supplier_id: row.supplier_id,
          name: row.name,
          description: row.description,
          price: row.price,
          sku: row.sku,
          unit: row.unit,
          img_name: row.img_name,
          discount: row.discount,
        });

        return {
          ...cartItem,
          product,
        };
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Add item to cart or update quantity if already exists
   */
  async addItem(cartId: number, productId: number, quantity: number): Promise<CartItem> {
    try {
      if (quantity < 1) {
        throw new ValidationError('Quantity must be at least 1');
      }

      // Check if item already exists in cart
      const existingItem = await this.db.get<DatabaseRow>(
        'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
        [cartId, productId],
      );

      if (existingItem) {
        // Update quantity by adding to existing
        const newQuantity = (existingItem.quantity as number) + quantity;
        const result = await this.db.run(
          'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
          [newQuantity, existingItem.cart_item_id],
        );

        if (result.changes === 0) {
          throw new Error('Failed to update cart item quantity');
        }

        const updated = await this.db.get<DatabaseRow>(
          'SELECT * FROM cart_items WHERE cart_item_id = ?',
          [existingItem.cart_item_id],
        );

        return objectToCamelCase<CartItem>(updated as DatabaseRow);
      } else {
        // Insert new item
        const now = new Date().toISOString();
        const { sql, values } = buildInsertSQL('cart_items', {
          cartId,
          productId,
          quantity,
          addedAt: now,
        });

        const result = await this.db.run(sql, values);

        const createdItem = await this.db.get<DatabaseRow>(
          'SELECT * FROM cart_items WHERE cart_item_id = ?',
          [result.lastID],
        );

        if (!createdItem) {
          throw new Error('Failed to retrieve created cart item');
        }

        return objectToCamelCase<CartItem>(createdItem);
      }
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update item quantity in cart
   */
  async updateItemQuantity(cartItemId: number, quantity: number): Promise<void> {
    try {
      if (quantity < 1) {
        throw new ValidationError('Quantity must be at least 1');
      }

      const result = await this.db.run(
        'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
        [quantity, cartItemId],
      );

      if (result.changes === 0) {
        throw new NotFoundError('CartItem', cartItemId);
      }
    } catch (error) {
      handleDatabaseError(error, 'CartItem', cartItemId);
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartItemId: number): Promise<void> {
    try {
      const result = await this.db.run(
        'DELETE FROM cart_items WHERE cart_item_id = ?',
        [cartItemId],
      );

      if (result.changes === 0) {
        throw new NotFoundError('CartItem', cartItemId);
      }
    } catch (error) {
      handleDatabaseError(error, 'CartItem', cartItemId);
    }
  }

  /**
   * Clear all items from cart
   */
  async clearCart(cartId: number): Promise<void> {
    try {
      await this.db.run('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update cart's updated_at timestamp
   */
  async touchCart(cartId: number): Promise<void> {
    try {
      const now = new Date().toISOString();
      await this.db.run(
        'UPDATE carts SET updated_at = ? WHERE cart_id = ?',
        [now, cartId],
      );
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

// Singleton instance for default usage
let cartRepo: CartRepository | null = null;

export async function getCartRepository(isTest: boolean = false): Promise<CartRepository> {
  if (!cartRepo) {
    cartRepo = await createCartRepository(isTest);
  }
  return cartRepo;
}
