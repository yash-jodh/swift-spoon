import type {
  AuthResponse,
  RestaurantsResponse,
  Restaurant,
  MenuResponse,
  CartResponse,
  OrdersResponse,
  OrderResponse,
  DeliveryAddress,
} from '@/types';

// ✅ FIXED: Use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_BASE_URL); // For debugging

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(response);
  },

  register: async (data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },

  updateProfile: async (data: { name: string; phone: string }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Restaurants API
export const restaurantsApi = {
  getFeatured: async (): Promise<RestaurantsResponse> => {
    const response = await fetch(`${API_BASE_URL}/restaurants/featured/list`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<RestaurantsResponse>(response);
  },

  getAll: async (params?: {
    search?: string;
    cuisine?: string;
    sortBy?: string;
  }): Promise<RestaurantsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.cuisine) searchParams.set('cuisine', params.cuisine);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);

    const response = await fetch(
      `${API_BASE_URL}/restaurants?${searchParams.toString()}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return handleResponse<RestaurantsResponse>(response);
  },

  getById: async (id: string): Promise<{ success: boolean; restaurant: Restaurant }> => {
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },
};

// Menu API
export const menuApi = {
  getByRestaurant: async (restaurantId: string): Promise<MenuResponse> => {
    const response = await fetch(`${API_BASE_URL}/menu/restaurant/${restaurantId}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<MenuResponse>(response);
  },
};

// Cart API
export const cartApi = {
  get: async (): Promise<CartResponse> => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<CartResponse>(response);
  },

  addItem: async (
    menuItemId: string,
    quantity: number = 1
  ): Promise<CartResponse> => {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ menuItemId, quantity }),
    });

    return handleResponse<CartResponse>(response);
  },

  updateItem: async (itemId: string, quantity: number): Promise<CartResponse> => {
    const response = await fetch(`${API_BASE_URL}/cart/item/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });
    return handleResponse<CartResponse>(response);
  },

  removeItem: async (itemId: string): Promise<CartResponse> => {
    const response = await fetch(`${API_BASE_URL}/cart/item/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<CartResponse>(response);
  },

  clear: async (): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Orders API
export const ordersApi = {
  create: async (data: {
    deliveryAddress: DeliveryAddress;
    paymentMethod: 'cash' | 'card' | 'upi';
    specialInstructions?: string;
  }): Promise<OrderResponse> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<OrderResponse>(response);
  },

  getMyOrders: async (): Promise<OrdersResponse> => {
    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<OrdersResponse>(response);
  },

  getById: async (id: string): Promise<OrderResponse> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<OrderResponse>(response);
  },

  cancel: async (id: string, cancelReason: string): Promise<OrderResponse> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cancelReason }),
    });
    return handleResponse<OrderResponse>(response);
  },
};