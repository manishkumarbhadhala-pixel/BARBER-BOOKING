import axios from 'axios';

const api = axios.create({
  baseURL: 'barber-booking-production-3f2d.up.railway.app',
  // baseURL: 'http://localhost:5000/api', // Railway URL ki jagah
});

// Har request me automatically token add ho
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 401 aur 403 response interceptor handler 🛠
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 aane par logout karo
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('shopInfo');
      window.location.href = '/';
    }
    
    // Suspended — 403 handle karke special page par redirect karo (Infinite Loop Fix ke sath) 🚫
    if (error.response?.status === 403 && error.response?.data?.suspended) {
      // Agar user pehle se hi /suspended page pr h, to maze se error fail hone do, redirect mat karo loop se bachne ke liye
      if (window.location.pathname !== '/suspended') {
        const info = error.response.data;
        localStorage.setItem('suspendedInfo', JSON.stringify(info));
        window.location.href = '/suspended';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Shop APIs
export const shopAPI = {
  verifyShop: (shopCode) => 
    api.get('/user/verify-shop', { params: { shopCode } }),
};

// Admin APIs
export const adminAPI = {
  getServices: () => api.get('/admin/services'),
  addService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
  getWorkingHours: () => api.get('/admin/working-hours'),
  updateWorkingHours: (data) => api.put('/admin/working-hours', data),
  getAppointments: (date) => api.get('/admin/appointments', { params: { date } }),
  markComplete: (id) => api.put(`/admin/appointments/${id}/complete`),
  adminBook: (data) => api.post('/admin/appointments/book', data),
  adminCancel: (id) => api.delete(`/admin/appointments/${id}`),
  getDailyIncome: (date) => api.get('/admin/income', { params: { date } }), 
  getMonthlyIncome: (month, year) => api.get('/admin/income/monthly', { params: { month, year } }),
  getUpiSettings: () => api.get('/admin/upi-settings'),
  updateUpiSettings: (data) => api.put('/admin/upi-settings', data),
};

// User APIs
export const userAPI = {
  getServices: (barberId) =>
    api.get('/user/services', { params: { barberId } }),
  getWorkingHours: (barberId) =>
    api.get('/user/working-hours', { params: { barberId } }),
  getBarbers: (shopId) => 
    api.get('/user/barbers', { params: { shopId } }),
  checkUpi: (barberId) => api.get('/user/upi-check', { params: { barberId } }),
};

// Appointment APIs
export const appointmentAPI = {
  getAvailableSlots: (serviceId, date, barberId) =>
    api.get('/appointments/available-slots', {
      params: { serviceId, date, barberId }
    }),
  getAllBusySlots: (date, barberId) =>
    api.get('/appointments/all-busy-slots', {
      params: { date, barberId }
    }),
  bookAppointment: (data) => api.post('/appointments/book', data),
  getMyAppointment: () => api.get('/appointments/my-appointment'),
  cancelAppointment: (id) => api.delete(`/appointments/${id}/cancel`),
};

// Announcement APIs (Fully Updated)
export const announcementAPI = {
  // Superadmin → Barbers
  getAll: () => api.get('/announcements'),
  create: (data) => api.post('/announcements', data),
  
  // Barber → Customers (Specific filter)
  getBarberAnnouncements: (barberId) =>
    api.get('/announcements/barber', { params: { barberId } }),
  createBarberAnnouncement: (data) =>
    api.post('/announcements/barber', data),

  // Customer → Shop ke saare barbers ke announcements (Global for User)
  getCustomerAnnouncements: () =>
    api.get('/announcements/customer'), 

  delete: (id) => api.delete(`/announcements/${id}`),
};

// Notes APIs 
export const notesAPI = {
  getAll: () => api.get('/notes'),
  create: (title) => api.post('/notes', { title }),
  toggle: (id) => api.put(`/notes/${id}/toggle`),
  delete: (id) => api.delete(`/notes/${id}`),
  getQuickNote: () => api.get('/notes/quick'),
  saveQuickNote: (content) => api.put('/notes/quick', { content }),
};

// Chat APIs 
export const chatAPI = {
  getAdminList: () => api.get('/chat/admins'),
  getSuperAdmin: () => api.get('/chat/superadmin-info'),
  getMessages: (withUserId) => api.get(`/chat/messages/${withUserId}`),
  sendMessage: (receiverId, message) => api.post('/chat/send', { receiverId, message }),
  getSuperAdminMessages: (withUserId) => api.get(`/chat/superadmin/messages/${withUserId}`),
  sendSuperAdminMessage: (receiverId, message) => api.post('/chat/superadmin/send', { receiverId, message }),
  getUnreadCount: () => api.get('/chat/unread-count'),
  getSuperAdminUnreadCount: () => api.get('/chat/superadmin/unread-count'),
};

export default api;