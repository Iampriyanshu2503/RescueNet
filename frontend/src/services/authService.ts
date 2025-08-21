import axios from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  token: string;
}

const API_URL = '/api/users';

// Register user
const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await axios.post(API_URL, userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Login user
const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Logout user
const logout = (): void => {
  localStorage.removeItem('user');
};

// Get user from localStorage
const getCurrentUser = (): AuthResponse | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get auth token
const getToken = (): string | null => {
  const user = getCurrentUser();
  return user ? user.token : null;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getToken
};

export default authService;