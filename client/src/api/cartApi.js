import api from './axios';

export const cartApi = {
  getCart: () => api.get('/cart'),
  addItem: (productId, qty = 1) => api.post('/cart/items', { product: productId, qty }),
  updateItem: (productId, qty) => api.put(`/cart/items/${productId}`, { qty }),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`),
  clearCart: () => api.delete('/cart'),
};
