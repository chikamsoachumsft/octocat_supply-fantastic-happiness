/**
 * @fileoverview Individual cart item component.
 * 
 * Displays a single item in the shopping cart with image, name, price,
 * quantity controls, and remove button.
 * 
 * @module components/cart/CartItem
 */

import { useTheme } from '../../context/ThemeContext';
import { CartItem as CartItemType } from '../../utils/cartStorage';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { darkMode } = useTheme();

  const handleQuantityChange = (change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      onUpdateQuantity(item.productId, newQuantity);
    }
  };

  const lineTotal = item.price * item.quantity;

  return (
    <div
      className={`flex items-center space-x-4 p-4 rounded-lg ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-md transition-colors duration-300`}
    >
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={`/${item.imgName}`}
          alt={item.name}
          className="w-20 h-20 object-contain rounded"
        />
      </div>

      {/* Product Info */}
      <div className="flex-grow">
        <h3
          className={`text-lg font-semibold ${
            darkMode ? 'text-light' : 'text-gray-800'
          } transition-colors duration-300`}
        >
          {item.name}
        </h3>
        <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
      </div>

      {/* Quantity Controls */}
      <div
        className={`flex items-center space-x-3 ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        } rounded-lg p-2 transition-colors duration-300`}
      >
        <button
          onClick={() => handleQuantityChange(-1)}
          className={`w-8 h-8 flex items-center justify-center ${
            darkMode ? 'text-light' : 'text-gray-700'
          } hover:text-primary transition-colors duration-300`}
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span
          className={`${
            darkMode ? 'text-light' : 'text-gray-800'
          } min-w-[2rem] text-center transition-colors duration-300`}
        >
          {item.quantity}
        </span>
        <button
          onClick={() => handleQuantityChange(1)}
          disabled={item.stockLevel !== undefined && item.quantity >= item.stockLevel}
          className={`w-8 h-8 flex items-center justify-center ${
            darkMode ? 'text-light' : 'text-gray-700'
          } hover:text-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {/* Line Total */}
      <div className="text-right min-w-[100px]">
        <p
          className={`text-lg font-bold ${
            darkMode ? 'text-light' : 'text-gray-800'
          } transition-colors duration-300`}
        >
          ${lineTotal.toFixed(2)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.productId)}
        className="text-red-500 hover:text-red-700 transition-colors duration-300"
        aria-label={`Remove ${item.name} from cart`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    </div>
  );
}
