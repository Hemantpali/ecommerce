import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { wishlistApi } from '../api/wishlistApi';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await wishlistApi.getWishlist();
      setItems(data.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const wishlistIds = useMemo(() => new Set(items.map((product) => product._id)), [items]);

  const isWishlisted = useCallback((productId) => wishlistIds.has(productId), [wishlistIds]);

  const addToWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        throw new Error('LOGIN_REQUIRED');
      }

      setUpdatingId(productId);
      try {
        const { data } = await wishlistApi.addItem(productId);
        setItems(data.data || []);
      } finally {
        setUpdatingId(null);
      }
    },
    [isAuthenticated]
  );

  const removeFromWishlist = useCallback(async (productId) => {
    setUpdatingId(productId);
    try {
      const { data } = await wishlistApi.removeItem(productId);
      setItems(data.data || []);
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const toggleWishlist = useCallback(
    async (productId) => {
      if (isWishlisted(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    },
    [addToWishlist, isWishlisted, removeFromWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistCount: items.length,
        loading,
        updatingId,
        isWishlisted,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
