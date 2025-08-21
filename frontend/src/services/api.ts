import axios from 'axios';
<<<<<<< HEAD
import authService from './authService';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
=======

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
>>>>>>> 26b07a5393d8ae16cdbe5d726dceffd72ac74d4c
  headers: {
    'Content-Type': 'application/json',
  },
});

<<<<<<< HEAD
// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from auth service
    const token = authService.getToken();
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
=======
// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
>>>>>>> 26b07a5393d8ae16cdbe5d726dceffd72ac74d4c
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Logout user if token is invalid or expired
      authService.logout();
      // Redirect to login page
      window.location.href = '/login';
    }
    
=======
// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
>>>>>>> 26b07a5393d8ae16cdbe5d726dceffd72ac74d4c
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
export default api;
=======
export default api;
>>>>>>> 26b07a5393d8ae16cdbe5d726dceffd72ac74d4c
