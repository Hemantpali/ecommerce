import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const EMPTY_CART = { items: [], subtotal: 0, itemCount: 0 };

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(EMPTY_CART);
      return;
    }

    setLoading(true);
    try {
      const { data } = await cartApi.getCart();
      setCart(data.data || EMPTY_CART);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (product, qty = 1) => {
      if (!isAuthenticated) {
        throw new Error('LOGIN_REQUIRED');
      }

      setUpdating(true);
      try {
        const { data } = await cartApi.addItem(product._id, qty);
        setCart(data.data || EMPTY_CART);
      } finally {
        setUpdating(false);
      }
    },
    [isAuthenticated]
  );

  const updateQty = useCallback(
    async (productId, qty) => {
      setUpdating(true);
      try {
        const { data } = await cartApi.updateItem(productId, qty);
        setCart(data.data || EMPTY_CART);
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  const removeFromCart = useCallback(async (productId) => {
    setUpdating(true);
    try {
      const { data } = await cartApi.removeItem(productId);
      setCart(data.data || EMPTY_CART);
    } finally {
      setUpdating(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    setUpdating(true);
    try {
      await cartApi.clearCart();
      setCart(EMPTY_CART);
    } finally {
      setUpdating(false);
    }
  }, []);

  const items = cart.items || [];
  const subtotal = cart.subtotal || 0;
  const cartCount = cart.itemCount || 0;

  const shipping = useMemo(() => (subtotal > 100 ? 0 : subtotal > 0 ? 10 : 0), [subtotal]);
  const tax = useMemo(() => subtotal * 0.1, [subtotal]);
  const total = useMemo(() => subtotal + shipping + tax, [subtotal, shipping, tax]);

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        shipping,
        tax,
        total,
        cartCount,
        loading,
        updating,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
