/**
 * @fileoverview Component tests for CartItem.
 * 
 * Tests cart item display, quantity controls, and remove functionality.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CartItem from './CartItem';
import { CartItem as CartItemType } from '../../utils/cartStorage';

// Mock ThemeContext
vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ darkMode: false }),
}));

describe('CartItem Component', () => {
  const mockItem: CartItemType = {
    productId: 1,
    name: 'Test Product',
    price: 10.99,
    quantity: 2,
    imgName: 'test.jpg',
  };

  const mockUpdateQuantity = vi.fn();
  const mockRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render cart item with product details', () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$10.99')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should render product image with correct src and alt', () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      const image = screen.getByRole('img', { name: 'Test Product' });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test.jpg');
    });

    it('should display correct line total', () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      // Line total: 10.99 * 2 = 21.98
      expect(screen.getByText('$21.98')).toBeInTheDocument();
    });

    it('should render line total with correct calculation for different quantities', () => {
      const item = { ...mockItem, quantity: 5 };
      render(
        <CartItem
          item={item}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      // Line total: 10.99 * 5 = 54.95
      expect(screen.getByText('$54.95')).toBeInTheDocument();
    });

    it('should render quantity controls', () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
    });

    it('should render remove button', () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      expect(screen.getByLabelText('Remove Test Product from cart')).toBeInTheDocument();
    });
  });

  describe('Quantity Controls', () => {
    it('should call onUpdateQuantity with increased quantity when + button clicked', () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      const increaseButton = screen.getByLabelText('Increase quantity');
      fireEvent.click(increaseButton);

      expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3);
    });

    it('should call onUpdateQuantity with decreased quantity when - button clicked', () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      const decreaseButton = screen.getByLabelText('Decrease quantity');
      fireEvent.click(decreaseButton);

      expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 1);
    });

    it('should not call onUpdateQuantity when decreasing quantity to 0', () => {
      const item = { ...mockItem, quantity: 1 };
      render(
        <CartItem
          item={item}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      const decreaseButton = screen.getByLabelText('Decrease quantity');
      fireEvent.click(decreaseButton);

      expect(mockUpdateQuantity).not.toHaveBeenCalled();
    });

    it('should handle multiple increment clicks', () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      const increaseButton = screen.getByLabelText('Increase quantity');
      fireEvent.click(increaseButton);
      fireEvent.click(increaseButton);

      expect(mockUpdateQuantity).toHaveBeenCalledTimes(2);
      expect(mockUpdateQuantity).toHaveBeenNthCalledWith(1, 1, 3);
      expect(mockUpdateQuantity).toHaveBeenNthCalledWith(2, 1, 3);
    });
  });

  describe('Stock Level Controls', () => {
    it('should disable increase button when quantity reaches stockLevel', () => {
      const item = { ...mockItem, quantity: 10, stockLevel: 10 };
      render(
        <CartItem
          item={item}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      const increaseButton = screen.getByLabelText('Increase quantity');
      expect(increaseButton).toBeDisabled();
    });

    it('should not disable increase button when quantity is below stockLevel', () => {
      const item = { ...mockItem, quantity: 5, stockLevel: 10 };
      render(
        <CartItem
          item={item}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      const increaseButton = screen.getByLabelText('Increase quantity');
      expect(increaseButton).not.toBeDisabled();
    });

    it('should not disable increase button when stockLevel is undefined', () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      const increaseButton = screen.getByLabelText('Increase quantity');
      expect(increaseButton).not.toBeDisabled();
    });

    it('should not call onUpdateQuantity when increase button is disabled', () => {
      const item = { ...mockItem, quantity: 10, stockLevel: 10 };
      render(
        <CartItem
          item={item}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      const increaseButton = screen.getByLabelText('Increase quantity');
      fireEvent.click(increaseButton);

      expect(mockUpdateQuantity).not.toHaveBeenCalled();
    });
  });

  describe('Remove Functionality', () => {
    it('should call onRemove with product ID when remove button clicked', () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      const removeButton = screen.getByLabelText('Remove Test Product from cart');
      fireEvent.click(removeButton);

      expect(mockRemove).toHaveBeenCalledWith(1);
      expect(mockRemove).toHaveBeenCalledTimes(1);
    });

    it('should call onRemove for correct product when multiple items exist', () => {
      const item2 = { ...mockItem, productId: 2, name: 'Product 2' };
      
      const { rerender } = render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      rerender(
        <CartItem
          item={item2}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      const removeButton = screen.getByLabelText('Remove Product 2 from cart');
      fireEvent.click(removeButton);

      expect(mockRemove).toHaveBeenCalledWith(2);
    });
  });

  describe('Price Calculations', () => {
    it('should calculate line total correctly with decimal prices', () => {
      const item = { ...mockItem, price: 19.99, quantity: 3 };
      render(
        <CartItem
          item={item}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      expect(screen.getByText('$59.97')).toBeInTheDocument();
    });

    it('should display price with two decimal places', () => {
      const item = { ...mockItem, price: 10.5, quantity: 1 };
      render(
        <CartItem
          item={item}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      expect(screen.getByText('$10.50')).toBeInTheDocument();
    });

    it('should handle large quantities correctly', () => {
      const item = { ...mockItem, price: 5.00, quantity: 100 };
      render(
        <CartItem
          item={item}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      expect(screen.getByText('$500.00')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for buttons', () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove Test Product from cart')).toBeInTheDocument();
    });

    it('should have alt text for product image', () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      const image = screen.getByAltText('Test Product');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should render correctly in dark mode', () => {
      vi.mock('../../context/ThemeContext', () => ({
        useTheme: () => ({ darkMode: true }),
      }));

      const { container } = render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={mockUpdateQuantity}
          onRemove={mockRemove}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
