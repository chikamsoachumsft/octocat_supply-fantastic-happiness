import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { darkMode } = useTheme();

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`flex flex-col items-center justify-center text-center py-20 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-24 w-24 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2
              className={`${darkMode ? 'text-light' : 'text-gray-800'} text-2xl font-bold mb-2`}
            >
              Your cart is empty
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Add some products to get started!
            </p>
            <Link
              to="/products"
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1
                className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}
              >
                Shopping Cart
              </h1>
              <button
                onClick={clearCart}
                className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'} text-sm font-medium transition-colors`}
              >
                Clear Cart
              </button>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-md flex items-center gap-4 transition-colors duration-300`}
                >
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={`/${item.imgName}`}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-1`}
                    >
                      {item.name}
                    </h3>
                    <p className="text-primary text-xl font-bold">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center space-x-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-1`}
                    >
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        -
                      </button>
                      <span
                        className={`${darkMode ? 'text-light' : 'text-gray-800'} min-w-[2rem] text-center font-medium`}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <p
                        className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}
                      >
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'} transition-colors`}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-md sticky top-24 transition-colors duration-300`}
            >
              <h2
                className={`text-2xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-6`}
              >
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Subtotal
                  </span>
                  <span
                    className={`font-medium ${darkMode ? 'text-light' : 'text-gray-800'}`}
                  >
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Shipping
                  </span>
                  <span
                    className={`font-medium ${darkMode ? 'text-light' : 'text-gray-800'}`}
                  >
                    Free
                  </span>
                </div>
                <div
                  className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'} pt-4`}
                >
                  <div className="flex justify-between">
                    <span
                      className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}
                    >
                      Total
                    </span>
                    <span className="text-lg font-bold text-primary">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-primary hover:bg-accent text-white py-3 rounded-lg font-medium transition-colors mb-3">
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className={`block text-center ${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} text-sm transition-colors`}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
