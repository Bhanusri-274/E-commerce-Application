import api from "../lib/axios";

export const authService = {
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }).then((r) => r.data),
  changePassword: (data) => api.put("/auth/change-password", data).then((r) => r.data),
};

export const userService = {
  updateProfile: (data) => api.put("/users/profile", data).then((r) => r.data),
  addAddress: (data) => api.post("/users/addresses", data).then((r) => r.data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data).then((r) => r.data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`).then((r) => r.data),
};

export const productService = {
  list: (params) => api.get("/products", { params }).then((r) => r.data),
  getOne: (identifier) => api.get(`/products/${identifier}`).then((r) => r.data),
  create: (data) => api.post("/products", data).then((r) => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
  reviews: (productId) => api.get(`/products/${productId}/reviews`).then((r) => r.data),
  addReview: (productId, data) => api.post(`/products/${productId}/reviews`, data).then((r) => r.data),
};

export const categoryService = {
  list: () => api.get("/categories").then((r) => r.data),
  create: (data) => api.post("/categories", data).then((r) => r.data),
  update: (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};

export const cartService = {
  get: () => api.get("/cart").then((r) => r.data),
  add: (productId, quantity = 1) => api.post("/cart", { productId, quantity }).then((r) => r.data),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }).then((r) => r.data),
  remove: (itemId) => api.delete(`/cart/${itemId}`).then((r) => r.data),
  applyCoupon: (code) => api.post("/cart/apply-coupon", { code }).then((r) => r.data),
  removeCoupon: () => api.delete("/cart/coupon").then((r) => r.data),
};

export const wishlistService = {
  get: () => api.get("/wishlist").then((r) => r.data),
  add: (productId) => api.post("/wishlist", { productId }).then((r) => r.data),
  remove: (productId) => api.delete(`/wishlist/${productId}`).then((r) => r.data),
};

export const orderService = {
  place: (data) => api.post("/orders", data).then((r) => r.data),
  myOrders: () => api.get("/orders/my").then((r) => r.data),
  getOne: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  cancel: (id) => api.put(`/orders/${id}/cancel`).then((r) => r.data),
};

export const bannerService = {
  list: (position) => api.get("/banners", { params: position ? { position } : {} }).then((r) => r.data),
};

export const adminService = {
  dashboard: () => api.get("/admin/dashboard").then((r) => r.data),
  orders: (params) => api.get("/admin/orders", { params }).then((r) => r.data),
  updateOrderStatus: (id, status, note) =>
    api.put(`/admin/orders/${id}/status`, { status, note }).then((r) => r.data),
  users: (params) => api.get("/admin/users", { params }).then((r) => r.data),
  toggleBlockUser: (id) => api.put(`/admin/users/${id}/block`).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  coupons: () => api.get("/admin/coupons").then((r) => r.data),
  createCoupon: (data) => api.post("/admin/coupons", data).then((r) => r.data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data).then((r) => r.data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`).then((r) => r.data),
  banners: () => api.get("/admin/banners").then((r) => r.data),
  createBanner: (data) => api.post("/admin/banners", data).then((r) => r.data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data).then((r) => r.data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`).then((r) => r.data),
  reviews: () => api.get("/admin/reviews").then((r) => r.data),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`).then((r) => r.data),
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("image", file);
    return api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
  },
};

export const paymentService = {
  confirmCOD:      (orderId) => api.post(`/payments/cod/${orderId}`).then((r) => r.data),
  verifyRazorpay:  (data)    => api.post("/payments/razorpay/verify", data).then((r) => r.data),
  getPayment:      (orderId) => api.get(`/payments/${orderId}`).then((r) => r.data),
};

export const notificationService = {
  list:       () => api.get("/notifications").then((r) => r.data),
  markRead:   (id) => api.put(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.put("/notifications/read-all").then((r) => r.data),
  remove:     (id) => api.delete(`/notifications/${id}`).then((r) => r.data),
};
