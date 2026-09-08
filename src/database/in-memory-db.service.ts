import { Injectable } from '@nestjs/common';
import {
  UserEntity,
  RestaurantEntity,
  MenuItemEntity,
  OrderEntity,
  CourierEntity,
  ReviewEntity,
  PromotionEntity,
  SupportTicketEntity,
} from './entities.js';
import {
  INITIAL_USERS,
  INITIAL_RESTAURANTS,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_COURIERS,
  INITIAL_REVIEWS,
  INITIAL_PROMOTIONS,
  INITIAL_SUPPORT_TICKETS,
} from './mock-data.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { OrderStatus } from '../common/enums/order-status.enum.js';

@Injectable()
export class InMemoryDbService {
  private users: UserEntity[] = [...INITIAL_USERS];
  private restaurants: RestaurantEntity[] = [...INITIAL_RESTAURANTS];
  private menuItems: MenuItemEntity[] = [...INITIAL_MENU_ITEMS];
  private orders: OrderEntity[] = [...INITIAL_ORDERS];
  private couriers: CourierEntity[] = [...INITIAL_COURIERS];
  private reviews: ReviewEntity[] = [...INITIAL_REVIEWS];
  private promotions: PromotionEntity[] = [...INITIAL_PROMOTIONS];
  private supportTickets: SupportTicketEntity[] = [...INITIAL_SUPPORT_TICKETS];
  private otpStore: Map<string, { code: string; expiresAt: number }> = new Map();

  // --- OTP Operations ---
  storeOtp(phoneNumber: string, code: string, ttlSeconds = 300) {
    this.otpStore.set(phoneNumber, {
      code,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  verifyOtp(phoneNumber: string, code: string): boolean {
    // For test convenience, the preset code '482901' always passes
    if (code === '482901') return true;

    const record = this.otpStore.get(phoneNumber);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(phoneNumber);
      return false;
    }
    const isValid = record.code === code;
    if (isValid) this.otpStore.delete(phoneNumber);
    return isValid;
  }

  // --- Users ---
  findUserById(id: string): UserEntity | undefined {
    return this.users.find((u) => u.id === id);
  }

  findUserByPhone(phone: string, role?: UserRole): UserEntity | undefined {
    return this.users.find((u) => u.phoneNumber === phone && (!role || u.role === role));
  }

  findUserByEmail(email: string): UserEntity | undefined {
    return this.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  }

  createUser(user: UserEntity): UserEntity {
    this.users.push(user);
    return user;
  }

  getAllUsers(): UserEntity[] {
    return this.users;
  }

  // --- Restaurants ---
  getRestaurants(filter?: {
    search?: string;
    tag?: string;
    cuisine?: string;
  }): RestaurantEntity[] {
    return this.restaurants.filter((r) => {
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCuisine = r.cuisine.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesCuisine) return false;
      }
      if (filter?.tag && filter.tag !== 'all') {
        if (!r.tags.includes(filter.tag)) return false;
      }
      if (filter?.cuisine) {
        if (!r.cuisine.some((c) => c.toLowerCase() === filter.cuisine?.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }

  getRestaurantById(id: string): RestaurantEntity | undefined {
    return this.restaurants.find((r) => r.id === id || r.slug === id);
  }

  updateRestaurantStatus(id: string, isOpen: boolean, isAcceptingOrders: boolean): RestaurantEntity | undefined {
    const r = this.getRestaurantById(id);
    if (r) {
      r.isOpen = isOpen;
      r.isAcceptingOrders = isAcceptingOrders;
    }
    return r;
  }

  updateRestaurant(id: string, updates: Partial<RestaurantEntity>): RestaurantEntity | undefined {
    const r = this.getRestaurantById(id);
    if (r) {
      Object.assign(r, updates);
    }
    return r;
  }

  // --- Menu Items ---
  getMenuItems(restaurantId: string): MenuItemEntity[] {
    return this.menuItems.filter((m) => m.restaurantId === restaurantId);
  }

  getMenuItemById(id: string): MenuItemEntity | undefined {
    return this.menuItems.find((m) => m.id === id);
  }

  addMenuItem(item: MenuItemEntity): MenuItemEntity {
    this.menuItems.push(item);
    return item;
  }

  updateMenuItem(id: string, updates: Partial<MenuItemEntity>): MenuItemEntity | undefined {
    const item = this.getMenuItemById(id);
    if (item) {
      Object.assign(item, updates);
    }
    return item;
  }

  deleteMenuItem(id: string): boolean {
    const index = this.menuItems.findIndex((m) => m.id === id);
    if (index !== -1) {
      this.menuItems.splice(index, 1);
      return true;
    }
    return false;
  }

  // --- Orders ---
  getOrders(): OrderEntity[] {
    return this.orders;
  }

  getOrderById(id: string): OrderEntity | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  getOrdersByCustomer(customerId: string): OrderEntity[] {
    return this.orders
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getOrdersByRestaurant(restaurantId: string): OrderEntity[] {
    return this.orders
      .filter((o) => o.restaurantId === restaurantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getOrdersByCourier(courierId: string): OrderEntity[] {
    return this.orders
      .filter((o) => o.courierId === courierId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  createOrder(order: OrderEntity): OrderEntity {
    this.orders.unshift(order);
    return order;
  }

  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    extra?: { prepTimeMinutes?: number; courierId?: string; note?: string },
  ): OrderEntity | undefined {
    const order = this.getOrderById(orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      if (extra?.prepTimeMinutes) order.prepTimeMinutes = extra.prepTimeMinutes;
      if (extra?.courierId) {
        order.courierId = extra.courierId;
        const courier = this.getCourierById(extra.courierId);
        if (courier) {
          order.courierName = courier.name;
          order.courierPhone = courier.phoneNumber;
        }
      }
      order.timeline.push({
        status,
        timestamp: new Date(),
        note: extra?.note,
      });
    }
    return order;
  }

  // --- Couriers ---
  getCouriers(): CourierEntity[] {
    return this.couriers;
  }

  getCourierById(id: string): CourierEntity | undefined {
    return this.couriers.find((c) => c.id === id || c.userId === id);
  }

  updateCourierDuty(id: string, isOnline: boolean): CourierEntity | undefined {
    const c = this.getCourierById(id);
    if (c) {
      c.isOnline = isOnline;
    }
    return c;
  }

  updateCourierLocation(id: string, lat: number, lng: number): CourierEntity | undefined {
    const c = this.getCourierById(id);
    if (c) {
      c.currentLat = lat;
      c.currentLng = lng;
    }
    return c;
  }

  // --- Reviews ---
  getReviews(restaurantId: string): ReviewEntity[] {
    return this.reviews
      .filter((r) => r.restaurantId === restaurantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  addReview(review: ReviewEntity): ReviewEntity {
    this.reviews.unshift(review);
    return review;
  }

  replyToReview(reviewId: string, reply: string): ReviewEntity | undefined {
    const rev = this.reviews.find((r) => r.id === reviewId);
    if (rev) {
      rev.merchantReply = reply;
    }
    return rev;
  }

  // --- Promotions ---
  getPromotions(): PromotionEntity[] {
    return this.promotions;
  }

  getPromotionByCode(code: string): PromotionEntity | undefined {
    return this.promotions.find((p) => p.code.toUpperCase() === code.toUpperCase() && p.active);
  }

  addPromotion(promo: PromotionEntity): PromotionEntity {
    this.promotions.push(promo);
    return promo;
  }

  // --- Support ---
  getSupportTickets(userId?: string): SupportTicketEntity[] {
    if (userId) {
      return this.supportTickets.filter((t) => t.userId === userId);
    }
    return this.supportTickets;
  }

  createSupportTicket(ticket: SupportTicketEntity): SupportTicketEntity {
    this.supportTickets.unshift(ticket);
    return ticket;
  }

  replySupportTicket(ticketId: string, sender: string, text: string): SupportTicketEntity | undefined {
    const ticket = this.supportTickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.messages.push({ sender, text, timestamp: new Date() });
    }
    return ticket;
  }
}
