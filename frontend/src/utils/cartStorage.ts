/**
 * @fileoverview Local storage utilities for shopping cart persistence.
 * 
 * Provides functions to save, load, and clear cart data from browser localStorage.
 * Cart items persist across page reloads and browser sessions on the same device.
 * 
 * @module utils/cartStorage
 */

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imgName: string;
  stockLevel?: number;
}

const CART_STORAGE_KEY = 'octocat-cart';

/**
 * Loads cart items from localStorage.
 * 
 * @returns Array of cart items or empty array if no cart exists or on error
 */
export function loadCart(): CartItem[] {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) {
      return [];
    }
    return JSON.parse(storedCart) as CartItem[];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
}

/**
 * Saves cart items to localStorage.
 * 
 * @param items - Array of cart items to save
 */
export function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

/**
 * Clears cart data from localStorage.
 */
export function clearCart(): void {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing cart from localStorage:', error);
  }
}
