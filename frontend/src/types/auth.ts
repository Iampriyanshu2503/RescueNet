export interface User {
  totalDonations: number;
  impactScore: number;
  mealsServed: number;
  organization: string;
  phone: string;
  address: string;
  _id: string;
  name: string;
  email: string;
  role: 'donor' | 'recipient' | 'volunteer';
  location?: {
    address?: string;
    coordinates?: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'donor' | 'recipient' | 'volunteer';
  location?: {
    address?: string;
    coordinates?: [number, number];
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
