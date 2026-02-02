export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'restaurant' | 'delivery';
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  cuisine: string[];
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image?: string;
  address?: string;
  phone?: string;
  isOpen?: boolean;
  description?: string;
}

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage';
  isVegetarian?: boolean;
  isVegan?: boolean;
  description?: string;
  image?: string;
  restaurant?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  restaurant: Restaurant | null;
}

export interface CartSummary {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  restaurant: Restaurant;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  totalAmount: number;
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'cash' | 'card' | 'upi';
  paymentStatus: 'pending' | 'paid' | 'failed';
  specialInstructions?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface RestaurantsResponse {
  success: boolean;
  restaurants: Restaurant[];
}

export interface MenuResponse {
  success: boolean;
  menuItems: MenuItem[];
}

export interface CartResponse {
  success: boolean;
  cart: Cart;
  summary: CartSummary;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
}

export interface OrderResponse {
  success: boolean;
  order: Order;
}
