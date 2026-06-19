import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api/productApi';

export const useProducts = ({ keyword = '', category = '', sort = 'newest', page = 1, limit = 12 } = {}) => {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await productApi.getProducts({
        keyword: keyword || undefined,
        category: category || undefined,
        sort,
        page,
        limit,
      });
      setProducts(data.data || []);
      setMeta(data.meta || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, category, sort, page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, meta, loading, error, refetch: fetchProducts };
};

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi
      .getCategories()
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
};
