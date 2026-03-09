/**
 * @fileoverview Checkout page component for guest orders.
 * 
 * Displays order summary, collects customer information (name and email),
 * and submits the order to the backend API.
 * 
 * @module components/checkout/CheckoutPage
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../api/config';

interface OrderRequest {
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export default function CheckoutPage() {
  const { darkMode } = useTheme();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const createOrder = useMutation(
    async (orderData: OrderRequest) => {
      const { data } = await axios.post(`${api.baseURL}${api.endpoints.orders}`, orderData);
      return data;
    },
    {
      onSuccess: (data) => {
        clearCart();
        navigate(`/order-success/${data.orderId}`);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.error || 'Failed to place order. Please try again.';
        alert(errorMessage);
      },
    }
  );

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};
    
    if (!customerName.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!customerEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const orderData: OrderRequest = {
      customerName,
      customerEmail,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    createOrder.mutate(orderData);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? 'bg-dark' : 'bg-gray-100'
      } pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-4xl mx-auto">
        <h1
          className={`text-3xl font-bold ${
            darkMode ? 'text-light' : 'text-gray-800'
          } mb-8 transition-colors duration-300`}
        >
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information Form */}
          <div>
            <div
              className={`p-6 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg transition-colors duration-300`}
            >
              <h2
                className={`text-2xl font-bold mb-6 ${
                  darkMode ? 'text-light' : 'text-gray-800'
                } transition-colors duration-300`}
              >
                Customer Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="customerName"
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-light' : 'text-gray-700'
                    } transition-colors duration-300`}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full px-4 py-2 ${
                      darkMode
                        ? 'bg-gray-700 text-light border-gray-600'
                        : 'bg-white text-gray-800 border-gray-300'
                    } rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300 ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="customerEmail"
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-light' : 'text-gray-700'
                    } transition-colors duration-300`}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={`w-full px-4 py-2 ${
                      darkMode
                        ? 'bg-gray-700 text-light border-gray-600'
                        : 'bg-white text-gray-800 border-gray-300'
                    } rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={createOrder.isLoading}
                  className="w-full bg-primary hover:bg-accent text-white py-3 rounded-lg transition-colors duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {createOrder.isLoading ? 'Processing...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div
              className={`p-6 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg transition-colors duration-300`}
            >
              <h2
                className={`text-2xl font-bold mb-6 ${
                  darkMode ? 'text-light' : 'text-gray-800'
                } transition-colors duration-300`}
              >
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className={`flex justify-between items-center pb-3 border-b ${
                      darkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={`/${item.imgName}`}
                        alt={item.name}
                        className="w-12 h-12 object-contain rounded"
                      />
                      <div>
                        <p
                          className={`font-medium ${
                            darkMode ? 'text-light' : 'text-gray-800'
                          } transition-colors duration-300`}
                        >
                          {item.name}
                        </p>
                        <p
                          className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          } transition-colors duration-300`}
                        >
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-primary font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className={`border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-300'
                } pt-4`}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
