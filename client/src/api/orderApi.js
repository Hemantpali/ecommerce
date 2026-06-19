import api from './axios';

export const orderApi = {
  createOrder: (data) => api.post('/orders', data),
  createOrderFromCart: (data) => api.post('/orders/from-cart', data),
  getMyOrders: () => api.get('/orders/my'),
  getOrder: (id) => api.get(`/orders/${id}`),
  getAllOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  payOrder: (id) => api.put(`/orders/${id}/pay`),
};
