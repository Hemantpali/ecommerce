import api from './axios';

export const couponApi = {
  getCoupons: () => api.get('/coupons'),
  getCoupon: (id) => api.get(`/coupons/${id}`),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  validateCoupon: (data) => api.post('/coupons/validate', data),
};
