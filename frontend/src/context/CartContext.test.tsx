/**
 * @fileoverview Unit tests for CartContext and useCart hook.
 * 
 * Tests cart state management, actions, and localStorage integration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { CartProvider, useCart } from './CartContext';
import * as cartStorage from '../utils/cartStorage';

// Mock the cart storage module
vi.mock('../utils/cartStorage', () => ({
  loadCart: vi.fn(() => []),
  saveCart: vi.fn(),
  clearCart: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('useCart hook', () => {
    it('should throw error when used outside CartProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useCart());
      }).toThrow('useCart must be used within a CartProvider');
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Initial state', () => {
    it('should initialize with empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.items).toEqual([]);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });

    it('should load existing cart from localStorage on mount', async () => {
      const mockItems = [
        {
          productId: 1,
          name: 'Test Product',
          price: 10.99,
          quantity: 2,
          imgName: 'test.jpg',
        },
      ];

      vi.mocked(cartStorage.loadCart).mockReturnValue(mockItems);

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.items).toEqual(mockItems);
      });

      expect(result.current.totalItems).toBe(2);
      expect(result.current.totalPrice).toBe(21.98);
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.99,
          imgName: 'test.jpg',
        }, 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toEqual({
        productId: 1,
        name: 'Test Product',
        price: 10.99,
        quantity: 2,
        imgName: 'test.jpg',
      });
      expect(result.current.totalItems).toBe(2);
      expect(result.current.totalPrice).toBe(21.98);
    });

    it('should add item with default quantity of 1', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.99,
          imgName: 'test.jpg',
        });
      });

      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.totalItems).toBe(1);
    });

    it('should update quantity when adding existing item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.00,
          imgName: 'test.jpg',
        }, 2);
      });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.00,
          imgName: 'test.jpg',
        }, 3);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.totalItems).toBe(5);
      expect(result.current.totalPrice).toBe(50.00);
    });

    it('should handle adding multiple different items', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          imgName: 'p1.jpg',
        }, 1);
        
        result.current.addItem({
          productId: 2,
          name: 'Product 2',
          price: 20.00,
          imgName: 'p2.jpg',
        }, 2);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.totalItems).toBe(3);
      expect(result.current.totalPrice).toBe(50.00);
    });

    it('should save to localStorage when adding item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.99,
          imgName: 'test.jpg',
        }, 1);
      });

      expect(cartStorage.saveCart).toHaveBeenCalled();
    });

    it('should handle items with stockLevel', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.00,
          imgName: 'test.jpg',
          stockLevel: 100,
        }, 2);
      });

      expect(result.current.items[0].stockLevel).toBe(100);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.00,
          imgName: 'test.jpg',
        }, 1);
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.removeItem(1);
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });

    it('should only remove specified item when multiple items exist', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          imgName: 'p1.jpg',
        }, 1);
        
        result.current.addItem({
          productId: 2,
          name: 'Product 2',
          price: 20.00,
          imgName: 'p2.jpg',
        }, 1);
      });

      act(() => {
        result.current.removeItem(1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].productId).toBe(2);
      expect(result.current.totalItems).toBe(1);
      expect(result.current.totalPrice).toBe(20.00);
    });

    it('should handle removing non-existent item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.00,
          imgName: 'test.jpg',
        }, 1);
      });

      act(() => {
        result.current.removeItem(999);
      });

      expect(result.current.items).toHaveLength(1);
    });

    it('should save to localStorage when removing item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.00,
          imgName: 'test.jpg',
        }, 1);
      });

      vi.clearAllMocks();

      act(() => {
        result.current.removeItem(1);
      });

      expect(cartStorage.saveCart).toHaveBeenCalled();
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.00,
          imgName: 'test.jpg',
        }, 2);
      });

      act(() => {
        result.current.updateQuantity(1, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.totalItems).toBe(5);
      expect(result.current.totalPrice).toBe(50.00);
    });

    it('should remove item when quantity is 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.00,
          imgName: 'test.jpg',
        }, 2);
      });

      act(() => {
        result.current.updateQuantity(1, 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should remove item when quantity is negative', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.00,
          imgName: 'test.jpg',
        }, 2);
      });

      act(() => {
        result.current.updateQuantity(1, -1);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should only update specified item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          imgName: 'p1.jpg',
        }, 2);
        
        result.current.addItem({
          productId: 2,
          name: 'Product 2',
          price: 20.00,
          imgName: 'p2.jpg',
        }, 3);
      });

      act(() => {
        result.current.updateQuantity(1, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.items[1].quantity).toBe(3);
      expect(result.current.totalItems).toBe(8);
    });

    it('should save to localStorage when updating quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.00,
          imgName: 'test.jpg',
        }, 1);
      });

      vi.clearAllMocks();

      act(() => {
        result.current.updateQuantity(1, 3);
      });

      expect(cartStorage.saveCart).toHaveBeenCalled();
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          imgName: 'p1.jpg',
        }, 1);
        
        result.current.addItem({
          productId: 2,
          name: 'Product 2',
          price: 20.00,
          imgName: 'p2.jpg',
        }, 2);
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });

    it('should call clearCart storage function', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.00,
          imgName: 'test.jpg',
        }, 1);
      });

      act(() => {
        result.current.clearCart();
      });

      expect(cartStorage.clearCart).toHaveBeenCalled();
    });

    it('should handle clearing already empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(() => {
        act(() => {
          result.current.clearCart();
        });
      }).not.toThrow();

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('getItemQuantity', () => {
    it('should return quantity of item in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Test Product',
          price: 10.00,
          imgName: 'test.jpg',
        }, 5);
      });

      expect(result.current.getItemQuantity(1)).toBe(5);
    });

    it('should return 0 for item not in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.getItemQuantity(999)).toBe(0);
    });

    it('should return correct quantity for specific item when multiple items exist', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          imgName: 'p1.jpg',
        }, 2);
        
        result.current.addItem({
          productId: 2,
          name: 'Product 2',
          price: 20.00,
          imgName: 'p2.jpg',
        }, 3);
      });

      expect(result.current.getItemQuantity(1)).toBe(2);
      expect(result.current.getItemQuantity(2)).toBe(3);
    });
  });

  describe('Calculations', () => {
    it('should calculate totalItems correctly', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          imgName: 'p1.jpg',
        }, 2);
        
        result.current.addItem({
          productId: 2,
          name: 'Product 2',
          price: 20.00,
          imgName: 'p2.jpg',
        }, 3);
        
        result.current.addItem({
          productId: 3,
          name: 'Product 3',
          price: 5.00,
          imgName: 'p3.jpg',
        }, 1);
      });

      expect(result.current.totalItems).toBe(6);
    });

    it('should calculate totalPrice correctly', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          imgName: 'p1.jpg',
        }, 2);
        
        result.current.addItem({
          productId: 2,
          name: 'Product 2',
          price: 20.50,
          imgName: 'p2.jpg',
        }, 3);
      });

      expect(result.current.totalPrice).toBe(81.50);
    });

    it('should handle decimal prices correctly', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          productId: 1,
          name: 'Product',
          price: 10.99,
          imgName: 'p.jpg',
        }, 3);
      });

      expect(result.current.totalPrice).toBe(32.97);
    });
  });
});
