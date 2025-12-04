import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import axios from 'axios';
import { api } from '../api/config';
import { getItemPrice } from '../utils/priceUtils';

interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  imgName: string;
  sku: string;
  unit: string;
  supplierId: number;
  discount?: number;
}

interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  addedAt: string;
  product: Product;
}

interface Cart {
  cartId: number;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_SESSION_KEY = 'octocat_cart_session';

const getSessionId = (): string => {
  let sessionId = localStorage.getItem(CART_SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${crypto.randomUUID()}`;
    localStorage.setItem(CART_SESSION_KEY, sessionId);
  }
  return sessionId;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionId = getSessionId();

  const refreshCart = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${api.baseURL}/api/cart/${sessionId}`);
      // API returns {cart, items}, transform to expected structure
      setCart({
        ...data.cart,
        items: data.items || [],
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [sessionId]);

  const addToCart = async (productId: number, quantity: number) => {
    try {
      await axios.post(`${api.baseURL}/api/cart/${sessionId}/items`, {
        productId,
        quantity,
      });
      await refreshCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      await axios.put(`${api.baseURL}/api/cart/${sessionId}/items/${cartItemId}`, {
        quantity,
      });
      await refreshCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await axios.delete(`${api.baseURL}/api/cart/${sessionId}/items/${cartItemId}`);
      await refreshCart();
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${api.baseURL}/api/cart/${sessionId}`);
      await refreshCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const totalItems = useMemo(() => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const price = getItemPrice(item.product);
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
