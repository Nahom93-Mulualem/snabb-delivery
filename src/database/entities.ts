import { UserRole } from '../common/enums/user-role.enum.js';
import { OrderStatus } from '../common/enums/order-status.enum.js';

export interface UserEntity {
  id: string;
  role: UserRole;
  name: string;
  phoneNumber?: string;
  email?: string;
  passwordHash?: string;
  clearanceKey?: string;
  twoFactorSecret?: string;
  addresses?: {
    id: string;
    label: string;
    street: string;
    city: string;
    doorCode?: string;
    isDefault: boolean;
  }[];
  createdAt: Date;
}

export interface MenuItemOptionChoice {
  name: string;
  price: number;
}

export interface MenuItemOption {
  name: string;
  required: boolean;
  choices: MenuItemOptionChoice[];
}

export interface MenuItemEntity {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  inStock: boolean;
  options?: MenuItemOption[];
  isPopular?: boolean;
}

export interface RestaurantEntity {
  id: string;
  name: string;
  slug: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryFee: number;
  minOrder: number;
  bannerImage: string;
  logoImage: string;
  address: string;
  isOpen: boolean;
  isAcceptingOrders: boolean;
  prepTimeDefault: number;
  tags: string[]; // 'fast', 'freedel', 'toprated', 'halal', 'vegan', 'deal'
  lat: number;
  lng: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  selectedOptions?: { optionName: string; choiceName: string; price: number }[];
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface OrderEntity {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  discount: number;
  total: number;
  status: OrderStatus;
  prepTimeMinutes: number;
  deliveryAddress: string;
  dropOffNote?: string;
  currentLat?: number;
  currentLng?: number;
  destinationLat: number;
  destinationLng: number;
  timeline: OrderTimelineEvent[];
  paymentMethod: string;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourierEntity {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  vehicleType: string;
  licenseNumber: string;
  isOnline: boolean;
  rating: number;
  completedDeliveries: number;
  earningsToday: number;
  tipsToday: number;
  currentLat: number;
  currentLng: number;
  activeOrderId?: string;
}

export interface ReviewEntity {
  id: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  merchantReply?: string;
  createdAt: Date;
}

export interface PromotionEntity {
  id: string;
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  discountAmount?: number;
  minOrderAmount: number;
  active: boolean;
  usageCount: number;
}

export interface SupportTicketEntity {
  id: string;
  userId: string;
  userRole: UserRole;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  messages: { sender: string; text: string; timestamp: Date }[];
  createdAt: Date;
}
