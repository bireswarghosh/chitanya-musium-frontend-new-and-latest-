import axios from 'axios';

// const API_BASE_URL = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api';
const API_BASE_URL = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api';


// Token interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const roleService = {
  // Get all roles
  getRoles: () => axios.get(`${API_BASE_URL}/roles`),
  
  // Get role by ID
  getRole: (id) => axios.get(`${API_BASE_URL}/roles/${id}`),
  
  // Add new role
  addRole: (roleData) => axios.post(`${API_BASE_URL}/roles`, roleData),
  
  // Update role
  updateRole: (id, roleData) => axios.put(`${API_BASE_URL}/roles/${id}`, roleData),
  
  // Delete role
  deleteRole: (id) => axios.delete(`${API_BASE_URL}/roles/${id}`)
};