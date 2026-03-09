/**
 * @fileoverview Order success confirmation page.
 * 
 * Displays order confirmation after successful checkout
 * with order ID and navigation options.
 * 
 * @module components/checkout/OrderSuccess
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen ${
        darkMode ? 'bg-dark' : 'bg-gray-100'
      } pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className={`p-8 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg text-center transition-colors duration-300`}
        >
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4">
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1
            className={`text-3xl font-bold mb-4 ${
              darkMode ? 'text-light' : 'text-gray-800'
            } transition-colors duration-300`}
          >
            Order Placed Successfully!
          </h1>

          <p
            className={`text-lg mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            } transition-colors duration-300`}
          >
            Thank you for your order!
          </p>

          <div
            className={`inline-block px-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            } mb-6 transition-colors duration-300`}
          >
            <p
              className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } transition-colors duration-300`}
            >
              Order ID
            </p>
            <p className="text-2xl font-bold text-primary">#{orderId}</p>
          </div>

          <p
            className={`mb-8 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            } transition-colors duration-300`}
          >
            You will receive an email confirmation shortly with your order details.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/products')}
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg transition-colors duration-300 font-semibold"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/')}
              className={`${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-light'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } px-6 py-3 rounded-lg transition-colors duration-300 font-semibold`}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
