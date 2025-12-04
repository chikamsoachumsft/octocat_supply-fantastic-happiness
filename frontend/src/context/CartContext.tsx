import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { api } from '../api/config';

export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImgName: string;
  quantity: number;
  addedAt: string;
  productDiscount?: number;
}

export interface Cart {
  cartId: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Simple user ID - in a real app, this would come from authentication
const USER_ID = 'demo-user';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await axios.get<Cart>(`${api.baseURL}/api/cart`, {
        params: { userId: USER_ID },
      });
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
      console.error('Error fetching cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId: number, quantity: number) => {
    try {
      setError(null);
      await axios.post(`${api.baseURL}/api/cart/items`, {
        userId: USER_ID,
        productId,
        quantity,
      });
      await fetchCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      throw err;
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      setError(null);
      await axios.put(`${api.baseURL}/api/cart/items/${cartItemId}`, {
        userId: USER_ID,
        quantity,
      });
      await fetchCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item quantity');
      throw err;
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      setError(null);
      await axios.delete(`${api.baseURL}/api/cart/items/${cartItemId}`, {
        params: { userId: USER_ID },
      });
      await fetchCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      await axios.delete(`${api.baseURL}/api/cart/clear`, {
        params: { userId: USER_ID },
      });
      await fetchCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      throw err;
    }
  };

  const getTotalItems = () => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const getTotalPrice = () => {
    return (
      cart?.items.reduce((sum, item) => {
        const price = item.productDiscount
          ? item.productPrice * (1 - item.productDiscount)
          : item.productPrice;
        return sum + price * item.quantity;
      }, 0) || 0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
        getTotalItems,
        getTotalPrice,
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
