/**
 * @fileoverview Shopping cart page component.
 * 
 * Displays all items in the cart, allows quantity adjustments and item removal,
 * shows cart summary, and provides checkout navigation.
 * 
 * @module components/cart/CartPage
 */

import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';

export default function CartPage() {
  const { darkMode } = useTheme();
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div
        className={`min-h-screen ${
          darkMode ? 'bg-dark' : 'bg-gray-100'
        } pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-5xl mx-auto">
          <h1
            className={`text-3xl font-bold ${
              darkMode ? 'text-light' : 'text-gray-800'
            } mb-8 transition-colors duration-300`}
          >
            Shopping Cart
          </h1>

          {/* Empty Cart State */}
          <div
            className={`flex flex-col items-center justify-center py-20 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-md transition-colors duration-300`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-24 w-24 mb-4 ${
                darkMode ? 'text-gray-600' : 'text-gray-400'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p
              className={`text-xl font-semibold mb-2 ${
                darkMode ? 'text-light' : 'text-gray-800'
              } transition-colors duration-300`}
            >
              Your cart is empty
            </p>
            <p
              className={`mb-6 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } transition-colors duration-300`}
            >
              Add some products to get started!
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? 'bg-dark' : 'bg-gray-100'
      } pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1
            className={`text-3xl font-bold ${
              darkMode ? 'text-light' : 'text-gray-800'
            } transition-colors duration-300`}
          >
            Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h1>
          <button
            onClick={clearCart}
            className={`text-sm ${
              darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
            } transition-colors duration-300`}
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div
              className={`sticky top-24 p-6 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg transition-colors duration-300`}
            >
              <h2
                className={`text-2xl font-bold mb-4 ${
                  darkMode ? 'text-light' : 'text-gray-800'
                } transition-colors duration-300`}
              >
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div
                  className={`flex justify-between ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  } transition-colors duration-300`}
                >
                  <span>Subtotal:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div
                  className={`flex justify-between ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  } transition-colors duration-300`}
                >
                  <span>Items:</span>
                  <span>{totalItems}</span>
                </div>
              </div>

              <div
                className={`border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-300'
                } pt-4 mb-6`}
              >
                <div
                  className={`flex justify-between text-xl font-bold ${
                    darkMode ? 'text-light' : 'text-gray-800'
                  } transition-colors duration-300`}
                >
                  <span>Total:</span>
                  <span className="text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary hover:bg-accent text-white py-3 rounded-lg transition-colors duration-300 font-semibold"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate('/products')}
                className={`w-full mt-3 ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-light'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } py-3 rounded-lg transition-colors duration-300`}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
