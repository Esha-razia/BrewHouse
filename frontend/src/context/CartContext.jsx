import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Guest cart helpers
  const getLocalCart = useCallback(() => {
    const stored = localStorage.getItem('brewhouse_guest_cart');
    return stored ? JSON.parse(stored) : { items: [] };
  }, []);

  const saveLocalCart = useCallback((newCart) => {
    localStorage.setItem('brewhouse_guest_cart', JSON.stringify(newCart));
    setCart(newCart);
  }, []);

  const fetchCart = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const { data } = await api.get('/cart');
        setCart(data);
      } catch (err) {
        console.error('Failed to fetch user cart', err);
      } finally {
        setLoading(false);
      }
    } else {
      setCart(getLocalCart());
    }
  }, [user, getLocalCart]);

  // Sync cart when user logs in/out
  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);

  const addToCart = async (productId, size, quantity, customization) => {
    if (user) {
      const { data } = await api.post('/cart', { productId, size, quantity, customization });
      setCart(data);
    } else {
      // Guest add to cart
      setLoading(true);
      try {
        const { data: productDetails } = await api.get(`/products/${productId}`);
        const localCart = getLocalCart();
        
        // Match product by ID, size, and matching customization sub-properties
        const existingIdx = localCart.items.findIndex(
          (item) =>
            item.product === productId &&
            item.size === size &&
            item.customization?.milk === customization.milk &&
            item.customization?.sugarLevel === customization.sugarLevel &&
            item.customization?.extraShot === customization.extraShot &&
            item.customization?.temperature === customization.temperature
        );

        if (existingIdx > -1) {
          localCart.items[existingIdx].quantity += quantity;
        } else {
          localCart.items.push({
            _id: 'guest_' + Math.random().toString(36).substring(2, 9),
            product: productId,
            name: productDetails.name,
            image: productDetails.image,
            size,
            unitPrice: productDetails.priceBySize[size],
            quantity,
            customization,
          });
        }

        saveLocalCart(localCart);
      } catch (err) {
        console.error('Failed to add to guest cart', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (user) {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      setCart(data);
    } else {
      const localCart = getLocalCart();
      const existing = localCart.items.find((item) => item._id === itemId);
      if (existing) {
        existing.quantity = quantity;
        saveLocalCart(localCart);
      }
    }
  };

  const removeItem = async (itemId) => {
    if (user) {
      const { data } = await api.delete(`/cart/${itemId}`);
      setCart(data);
    } else {
      const localCart = getLocalCart();
      localCart.items = localCart.items.filter((item) => item._id !== itemId);
      saveLocalCart(localCart);
    }
  };

  const clearCart = async () => {
    if (user) {
      const { data } = await api.delete('/cart');
      setCart(data);
    } else {
      saveLocalCart({ items: [] });
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, itemCount, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
