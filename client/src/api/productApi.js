import api from './axios';

export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  uploadProductImage: (data) =>
    api.post('/uploads/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  createReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};
