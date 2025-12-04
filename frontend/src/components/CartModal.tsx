import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cart, updateQuantity, removeItem, clearCart, getTotalPrice, isLoading } = useCart();
  const { darkMode } = useTheme();

  if (!isOpen) {
    return null;
  }

  const totalPrice = getTotalPrice();

  const handleQuantityChange = async (cartItemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      await updateQuantity(cartItemId, newQuantity);
    }
  };

  const handleRemove = async (cartItemId: number) => {
    await removeItem(cartItemId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div
          className={`inline-block align-bottom ${darkMode ? 'bg-dark text-light' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}
        >
          {/* Header */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} px-4 py-3 sm:px-6 flex justify-between items-center`}>
            <h3 className="text-lg leading-6 font-medium" id="modal-title">
              Shopping Cart
            </h3>
            <button
              onClick={onClose}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'} transition-colors`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-5 sm:p-6 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : cart && cart.items.length > 0 ? (
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const price = item.productDiscount
                    ? item.productPrice * (1 - item.productDiscount)
                    : item.productPrice;

                  return (
                    <div
                      key={item.cartItemId}
                      className={`flex items-center space-x-4 p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                    >
                      <img
                        src={`/products/${item.productImgName}`}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/products/placeholder.png';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-primary font-semibold">${price.toFixed(2)}</span>
                          {item.productDiscount && (
                            <span className={`text-sm line-through ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              ${item.productPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity, -1)}
                          className="p-1 rounded-full bg-primary text-white hover:bg-accent transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity, 1)}
                          className="p-1 rounded-full bg-primary text-white hover:bg-accent transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${(price * item.quantity).toFixed(2)}</div>
                        <button
                          onClick={() => handleRemove(item.cartItemId)}
                          className="text-red-500 hover:text-red-700 text-sm mt-1 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <svg
                  className="mx-auto h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p>Your cart is empty</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {cart && cart.items.length > 0 && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0`}>
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} text-gray-800 dark:text-light px-4 py-2 rounded-md text-sm font-medium transition-colors`}
                  >
                    Clear Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Checkout functionality coming soon!');
                    }}
                    className="flex-1 bg-primary hover:bg-accent text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
