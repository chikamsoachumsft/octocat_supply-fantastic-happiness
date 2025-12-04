import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cart, loading, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleQuantityChange = async (cartItemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      try {
        await updateQuantity(cartItemId, newQuantity);
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await removeItem(cartItemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1
              className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
            >
              Shopping Cart
            </h1>
            {!isEmpty && (
              <button
                onClick={handleClearCart}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {isEmpty ? (
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
              <p className={`${darkMode ? 'text-light' : 'text-gray-800'} text-xl font-medium mb-4`}>
                Your cart is empty
              </p>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {cart.items.map((item) => {
                  const hasDiscount = item.product.discount != null && item.product.discount > 0;
                  const price = hasDiscount
                    ? item.product.price * (1 - item.product.discount!)
                    : item.product.price;
                  const subtotal = price * item.quantity;

                  return (
                    <div
                      key={item.cartItemId}
                      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg transition-colors duration-300`}
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        <div
                          className={`w-full md:w-48 h-48 ${darkMode ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-100 to-white'} rounded-lg flex items-center justify-center p-4`}
                        >
                          <img
                            src={`/${item.product.imgName}`}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3
                                className={`text-2xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
                              >
                                {item.product.name}
                              </h3>
                              <p
                                className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2 transition-colors duration-300`}
                              >
                                {item.product.description}
                              </p>
                              <p
                                className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 text-sm transition-colors duration-300`}
                              >
                                SKU: {item.product.sku}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.cartItemId)}
                              className="text-red-500 hover:text-red-600 transition-colors p-2"
                              aria-label={`Remove ${item.product.name} from cart`}
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

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex items-center space-x-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-2 transition-colors duration-300`}
                              >
                                <button
                                  onClick={() =>
                                    handleQuantityChange(item.cartItemId, item.quantity, -1)
                                  }
                                  className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors duration-300`}
                                  aria-label={`Decrease quantity of ${item.product.name}`}
                                >
                                  <span aria-hidden="true">-</span>
                                </button>
                                <span
                                  className={`${darkMode ? 'text-light' : 'text-gray-800'} min-w-[2rem] text-center transition-colors duration-300`}
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(item.cartItemId, item.quantity, 1)
                                  }
                                  className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors duration-300`}
                                  aria-label={`Increase quantity of ${item.product.name}`}
                                >
                                  <span aria-hidden="true">+</span>
                                </button>
                              </div>

                              <div className="text-left">
                                {hasDiscount ? (
                                  <>
                                    <div className="text-sm text-gray-500 line-through">
                                      ${item.product.price.toFixed(2)} each
                                    </div>
                                    <div className="text-lg font-semibold text-primary">
                                      ${price.toFixed(2)} each
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-lg font-semibold text-primary">
                                    ${price.toFixed(2)} each
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm text-gray-500 mb-1">Subtotal</div>
                              <div className="text-2xl font-bold text-primary">
                                ${subtotal.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg mt-6 transition-colors duration-300`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2
                    className={`text-2xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
                  >
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span
                      className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
                    >
                      Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)
                    </span>
                    <span
                      className={`${darkMode ? 'text-light' : 'text-gray-800'} font-semibold transition-colors duration-300`}
                    >
                      ${getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                      Total
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      ${getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full py-3 bg-primary hover:bg-accent text-white text-lg font-semibold rounded-lg transition-colors"
                  onClick={() => alert('Checkout functionality coming soon!')}
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className={`w-full mt-3 py-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-light' : 'text-gray-800'} text-lg font-semibold rounded-lg transition-colors`}
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
