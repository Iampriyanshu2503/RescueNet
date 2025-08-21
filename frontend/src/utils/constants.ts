// API Configuration
export const API_BASE_URL = 'http://localhost:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/users/login',
    REGISTER: '/users',
    PROFILE: '/users/profile',
  },
  
  // Food donation endpoints
  FOOD_DONATIONS: {
    BASE: '/food-donations',
    MY_DONATIONS: '/food-donations/my-donations',
    BY_ID: (id: string) => `/food-donations/${id}`,
  },
  
  // Waste pickup endpoints
  WASTE_PICKUPS: {
    BASE: '/waste-pickups',
    MY_PICKUPS: '/waste-pickups/my-pickups',
    BY_ID: (id: string) => `/waste-pickups/${id}`,
  },
};

// User roles
export const USER_ROLES = {
  DONOR: 'donor',
  RECIPIENT: 'recipient',
  VOLUNTEER: 'volunteer',
} as const;

// Food donation status
export const DONATION_STATUS = {
  AVAILABLE: 'available',
  CLAIMED: 'claimed',
  COMPLETED: 'completed',
} as const;

// Waste pickup status
export const PICKUP_STATUS = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
};

// Toast notification durations
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
};

// Form validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};
