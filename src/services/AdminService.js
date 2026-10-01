import axios from 'axios';

// const API_BASE_URL = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api';
// const API_BASE_URL = 'http://localhost:3003/api';
const API_BASE_URL = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api';

// Token interceptor disabled for development
// axios.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export const adminService = {
  // Get all admins
  getAdmins: () => axios.get(`${API_BASE_URL}/admin`),
  
  // Add new admin
  addAdmin: (adminData) => axios.post(`${API_BASE_URL}/admin`, adminData),
  
  // Update admin
  updateAdmin: (id, adminData) => axios.put(`${API_BASE_URL}/admin/${id}`, adminData),
  
  // Delete admin
  deleteAdmin: (id) => axios.delete(`${API_BASE_URL}/admin/${id}`),
  
  // Get admin roles
  getRoles: () => axios.get(`${API_BASE_URL}/admin/roles/list`)
};