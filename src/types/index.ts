// src/types/index.ts or src/types/order.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'restaurant' | 'delivery' | 'admin';
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  cuisine: string[];
  address: Address;
  phone?: string;
  image?: string;
  rating?: number;
  deliveryFee: number;
  deliveryTime?: string;
  isFeatured?: boolean;
  isOpen?: boolean;
}

export interface MenuItem {
  _id: string;
  restaurant: string | Restaurant;
  name: string;
  description?: string;
  price: number;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage';
  image?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isAvailable?: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  addedAt?: string;
}

export interface Cart {
  _id: string;
  user: string | User;
  items: CartItem[];
  restaurant: Restaurant | null;
  updatedAt: string;
}

export interface OrderItem {
  menuItem: MenuItem | string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: User | string;
  restaurant: Restaurant;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  deliveryAddress: Address;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  deliveryPartner?: User | string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'wallet';
  paymentStatus: 'pending' | 'completed' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  specialInstructions?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: User | string;
  restaurant: Restaurant | string;
  order: Order | string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface OrderResponse {
  success: boolean;
  order: Order;
  message?: string;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
  count: number;
  message?: string;
}

export interface CartResponse {
  success: boolean;
  cart: Cart;
  summary?: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    itemCount: number;
  };
  message?: string;
}

export interface RestaurantResponse {
  success: boolean;
  restaurant: Restaurant;
  message?: string;
}

export interface RestaurantsResponse {
  success: boolean;
  restaurants: Restaurant[];
  count: number;
  message?: string;
}