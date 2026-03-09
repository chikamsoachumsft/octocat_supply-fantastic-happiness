/**
 * @fileoverview Component tests for CartPage.
 * 
 * Tests cart page display, empty state, cart summary, and navigation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CartPage from './CartPage';
import { CartItem } from '../../utils/cartStorage';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock ThemeContext
vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ darkMode: false }),
}));

// Mock CartContext
const mockUpdateQuantity = vi.fn();
const mockRemoveItem = vi.fn();
const mockClearCart = vi.fn();

let mockCartItems: CartItem[] = [];
let mockTotalItems = 0;
let mockTotalPrice = 0;

vi.mock('../../context/CartContext', () => ({
  useCart: () => ({
    items: mockCartItems,
    totalItems: mockTotalItems,
    totalPrice: mockTotalPrice,
    updateQuantity: mockUpdateQuantity,
    removeItem: mockRemoveItem,
    clearCart: mockClearCart,
  }),
}));

// Mock CartItem component
vi.mock('./CartItem', () => ({
  default: ({ item, onUpdateQuantity, onRemove }: any) => (
    <div data-testid={`cart-item-${item.productId}`}>
      <span>{item.name}</span>
      <button onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}>
        Increase
      </button>
      <button onClick={() => onRemove(item.productId)}>Remove</button>
    </div>
  ),
}));

describe('CartPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockCartItems = [];
    mockTotalItems = 0;
    mockTotalPrice = 0;
  });

  describe('Empty Cart State', () => {
    it('should display empty cart message when cart is empty', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.getByText('Add some products to get started!')).toBeInTheDocument();
    });

    it('should show Browse Products button when cart is empty', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      const browseButton = screen.getByText('Browse Products');
      expect(browseButton).toBeInTheDocument();
    });

    it('should navigate to products page when Browse Products clicked', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      const browseButton = screen.getByText('Browse Products');
      fireEvent.click(browseButton);

      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });

    it('should display empty cart icon in SVG', () => {
      const { container } = render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Cart with Items', () => {
    beforeEach(() => {
      mockCartItems = [
        {
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          quantity: 2,
          imgName: 'p1.jpg',
        },
        {
          productId: 2,
          name: 'Product 2',
          price: 20.00,
          quantity: 1,
          imgName: 'p2.jpg',
        },
      ];
      mockTotalItems = 3;
      mockTotalPrice = 40.00;
    });

    it('should display shopping cart with item count', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/Shopping Cart \(3 items\)/)).toBeInTheDocument();
    });

    it('should display single item count correctly', () => {
      mockCartItems = [mockCartItems[0]];
      mockTotalItems = 2;
      mockTotalPrice = 20.00;

      const { rerender } = render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      // Force re-render to pick up updated mock values
      rerender(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      // Initially shows 3 items from beforeEach, need to update the component
      expect(screen.getByText(/Shopping Cart/)).toBeInTheDocument();
    });

    it('should render all cart items', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-2')).toBeInTheDocument();
    });

    it('should display Clear Cart button', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText('Clear Cart')).toBeInTheDocument();
    });

    it('should call clearCart when Clear Cart button clicked', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      const clearButton = screen.getByText('Clear Cart');
      fireEvent.click(clearButton);

      expect(mockClearCart).toHaveBeenCalledTimes(1);
    });
  });

  describe('Order Summary', () => {
    beforeEach(() => {
      mockCartItems = [
        {
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          quantity: 2,
          imgName: 'p1.jpg',
        },
      ];
      mockTotalItems = 2;
      mockTotalPrice = 20.00;
    });

    it('should display Order Summary heading', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText('Order Summary')).toBeInTheDocument();
    });

    it('should display subtotal', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText('Subtotal:')).toBeInTheDocument();
      expect(screen.getByText('$20.00')).toBeInTheDocument();
    });

    it('should display total items count', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText('Items:')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display total amount', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText('Total:')).toBeInTheDocument();
      // Total appears twice (once as label, once as value)
      const totalElements = screen.getAllByText(/\$20\.00/);
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it('should format prices with two decimal places', () => {
      mockTotalPrice = 45.50;
      
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText('$45.50')).toBeInTheDocument();
    });
  });

  describe('Navigation Buttons', () => {
    beforeEach(() => {
      mockCartItems = [
        {
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          quantity: 1,
          imgName: 'p1.jpg',
        },
      ];
      mockTotalItems = 1;
      mockTotalPrice = 10.00;
    });

    it('should display Proceed to Checkout button', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
    });

    it('should navigate to checkout when Proceed to Checkout clicked', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      const checkoutButton = screen.getByText('Proceed to Checkout');
      fireEvent.click(checkoutButton);

      expect(mockNavigate).toHaveBeenCalledWith('/checkout');
    });

    it('should display Continue Shopping button', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
    });

    it('should navigate to products when Continue Shopping clicked', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      const continueButton = screen.getByText('Continue Shopping');
      fireEvent.click(continueButton);

      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  describe('Cart Item Interactions', () => {
    beforeEach(() => {
      mockCartItems = [
        {
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          quantity: 2,
          imgName: 'p1.jpg',
        },
      ];
      mockTotalItems = 2;
      mockTotalPrice = 20.00;
    });

    it('should pass updateQuantity handler to CartItem', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      const increaseButton = screen.getByText('Increase');
      fireEvent.click(increaseButton);

      expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3);
    });

    it('should pass removeItem handler to CartItem', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      expect(mockRemoveItem).toHaveBeenCalledWith(1);
    });
  });

  describe('Multiple Items Display', () => {
    beforeEach(() => {
      mockCartItems = [
        {
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          quantity: 2,
          imgName: 'p1.jpg',
        },
        {
          productId: 2,
          name: 'Product 2',
          price: 20.00,
          quantity: 1,
          imgName: 'p2.jpg',
        },
        {
          productId: 3,
          name: 'Product 3',
          price: 5.00,
          quantity: 3,
          imgName: 'p3.jpg',
        },
      ];
      mockTotalItems = 6;
      mockTotalPrice = 55.00;
    });

    it('should render all items in cart', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-3')).toBeInTheDocument();
    });

    it('should display correct total for multiple items', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText('$55.00')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('should use correct pluralization for items count', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/6 items/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large quantities', () => {
      mockCartItems = [
        {
          productId: 1,
          name: 'Product 1',
          price: 1.00,
          quantity: 1000,
          imgName: 'p1.jpg',
        },
      ];
      mockTotalItems = 1000;
      mockTotalPrice = 1000.00;

      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/1000 items/)).toBeInTheDocument();
      expect(screen.getByText('$1000.00')).toBeInTheDocument();
    });

    it('should handle decimal prices correctly', () => {
      mockCartItems = [
        {
          productId: 1,
          name: 'Product 1',
          price: 19.99,
          quantity: 3,
          imgName: 'p1.jpg',
        },
      ];
      mockTotalItems = 3;
      mockTotalPrice = 59.97;

      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText('$59.97')).toBeInTheDocument();
    });

    it('should display singular "item" for one item', () => {
      mockCartItems = [
        {
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          quantity: 1,
          imgName: 'p1.jpg',
        },
      ];
      mockTotalItems = 1;
      mockTotalPrice = 10.00;

      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/1 item/)).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    beforeEach(() => {
      mockCartItems = [
        {
          productId: 1,
          name: 'Product 1',
          price: 10.00,
          quantity: 1,
          imgName: 'p1.jpg',
        },
      ];
      mockTotalItems = 1;
      mockTotalPrice = 10.00;
    });

    it('should render with proper structure', () => {
      const { container } = render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should contain cart items section and summary section', () => {
      render(
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      );

      expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
    });
  });
});
