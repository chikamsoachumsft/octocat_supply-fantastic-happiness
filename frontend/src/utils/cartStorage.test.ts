/**
 * @fileoverview Unit tests for cart storage utilities.
 * 
 * Tests localStorage operations for cart persistence including load, save, and clear.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadCart, saveCart, clearCart, CartItem } from './cartStorage';

describe('cartStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadCart', () => {
    it('should return empty array when localStorage is empty', () => {
      const result = loadCart();
      expect(result).toEqual([]);
    });

    it('should load cart items from localStorage', () => {
      const mockItems: CartItem[] = [
        {
          productId: 1,
          name: 'Test Product',
          price: 10.99,
          quantity: 2,
          imgName: 'test.jpg',
        },
      ];

      localStorage.setItem('octocat-cart', JSON.stringify(mockItems));
      const result = loadCart();
      
      expect(result).toEqual(mockItems);
    });

    it('should load multiple cart items from localStorage', () => {
      const mockItems: CartItem[] = [
        {
          productId: 1,
          name: 'Product 1',
          price: 10.99,
          quantity: 2,
          imgName: 'product1.jpg',
        },
        {
          productId: 2,
          name: 'Product 2',
          price: 24.99,
          quantity: 1,
          imgName: 'product2.jpg',
          stockLevel: 10,
        },
      ];

      localStorage.setItem('octocat-cart', JSON.stringify(mockItems));
      const result = loadCart();
      
      expect(result).toEqual(mockItems);
      expect(result).toHaveLength(2);
    });

    it('should return empty array on JSON parse error', () => {
      localStorage.setItem('octocat-cart', 'invalid-json');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = loadCart();
      
      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle cart items with optional stockLevel field', () => {
      const mockItems: CartItem[] = [
        {
          productId: 1,
          name: 'Product with stock',
          price: 15.00,
          quantity: 3,
          imgName: 'stock.jpg',
          stockLevel: 100,
        },
        {
          productId: 2,
          name: 'Product without stock',
          price: 20.00,
          quantity: 1,
          imgName: 'nostock.jpg',
        },
      ];

      localStorage.setItem('octocat-cart', JSON.stringify(mockItems));
      const result = loadCart();
      
      expect(result[0].stockLevel).toBe(100);
      expect(result[1].stockLevel).toBeUndefined();
    });
  });

  describe('saveCart', () => {
    it('should save cart items to localStorage', () => {
      const mockItems: CartItem[] = [
        {
          productId: 1,
          name: 'Test Product',
          price: 10.99,
          quantity: 2,
          imgName: 'test.jpg',
        },
      ];

      saveCart(mockItems);
      
      const stored = localStorage.getItem('octocat-cart');
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!)).toEqual(mockItems);
    });

    it('should save empty cart to localStorage', () => {
      saveCart([]);
      
      const stored = localStorage.getItem('octocat-cart');
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!)).toEqual([]);
    });

    it('should save multiple items to localStorage', () => {
      const mockItems: CartItem[] = [
        {
          productId: 1,
          name: 'Product 1',
          price: 10.99,
          quantity: 2,
          imgName: 'product1.jpg',
        },
        {
          productId: 2,
          name: 'Product 2',
          price: 24.99,
          quantity: 1,
          imgName: 'product2.jpg',
        },
        {
          productId: 3,
          name: 'Product 3',
          price: 5.99,
          quantity: 5,
          imgName: 'product3.jpg',
          stockLevel: 50,
        },
      ];

      saveCart(mockItems);
      
      const stored = localStorage.getItem('octocat-cart');
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(3);
      expect(parsed).toEqual(mockItems);
    });

    it('should overwrite existing cart data', () => {
      const firstItems: CartItem[] = [
        {
          productId: 1,
          name: 'First Product',
          price: 10.00,
          quantity: 1,
          imgName: 'first.jpg',
        },
      ];

      const secondItems: CartItem[] = [
        {
          productId: 2,
          name: 'Second Product',
          price: 20.00,
          quantity: 2,
          imgName: 'second.jpg',
        },
      ];

      saveCart(firstItems);
      saveCart(secondItems);
      
      const stored = localStorage.getItem('octocat-cart');
      expect(JSON.parse(stored!)).toEqual(secondItems);
    });

    it('should handle errors when localStorage is not available', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const mockItems: CartItem[] = [
        {
          productId: 1,
          name: 'Test',
          price: 10.00,
          quantity: 1,
          imgName: 'test.jpg',
        },
      ];

      saveCart(mockItems);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearCart', () => {
    it('should remove cart data from localStorage', () => {
      const mockItems: CartItem[] = [
        {
          productId: 1,
          name: 'Test Product',
          price: 10.99,
          quantity: 2,
          imgName: 'test.jpg',
        },
      ];

      localStorage.setItem('octocat-cart', JSON.stringify(mockItems));
      expect(localStorage.getItem('octocat-cart')).toBeDefined();
      
      clearCart();
      
      expect(localStorage.getItem('octocat-cart')).toBeNull();
    });

    it('should not throw error when cart is already empty', () => {
      expect(() => clearCart()).not.toThrow();
      expect(localStorage.getItem('octocat-cart')).toBeNull();
    });

    it('should handle errors when localStorage is not available', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      clearCart();
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      removeItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Integration: load, save, clear workflow', () => {
    it('should support complete cart lifecycle', () => {
      // Start with empty cart
      expect(loadCart()).toEqual([]);

      // Add items
      const items: CartItem[] = [
        {
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          quantity: 1,
          imgName: 'p1.jpg',
        },
      ];
      saveCart(items);
      expect(loadCart()).toEqual(items);

      // Update items
      const updatedItems: CartItem[] = [
        ...items,
        {
          productId: 2,
          name: 'Product 2',
          price: 20.00,
          quantity: 2,
          imgName: 'p2.jpg',
        },
      ];
      saveCart(updatedItems);
      expect(loadCart()).toEqual(updatedItems);

      // Clear cart
      clearCart();
      expect(loadCart()).toEqual([]);
    });
  });
});
