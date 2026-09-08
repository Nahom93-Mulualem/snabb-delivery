import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryDbService } from '../../database/in-memory-db.service.js';
import { RestaurantEntity } from '../../database/entities.js';

@Injectable()
export class RestaurantsService {
  constructor(private db: InMemoryDbService) {}

  findAll(filters?: { search?: string; tag?: string; cuisine?: string }): RestaurantEntity[] {
    return this.db.getRestaurants(filters);
  }

  findById(id: string): RestaurantEntity {
    const r = this.db.getRestaurantById(id);
    if (!r) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }
    return r;
  }

  updateStatus(id: string, isOpen: boolean, isAcceptingOrders: boolean): RestaurantEntity {
    const updated = this.db.updateRestaurantStatus(id, isOpen, isAcceptingOrders);
    if (!updated) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }
    return updated;
  }

  updateProfile(id: string, updates: Partial<RestaurantEntity>): RestaurantEntity {
    const updated = this.db.updateRestaurant(id, updates);
    if (!updated) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }
    return updated;
  }

  getAnalytics(id: string) {
    const orders = this.db.getOrdersByRestaurant(id);
    const completedOrders = orders.filter((o) => o.status === 'DELIVERED');
    const totalSales = orders.reduce((sum, o) => sum + o.subtotal, 0);

    return {
      restaurantId: id,
      todaysSales: totalSales,
      totalOrders: orders.length,
      fulfilledCount: completedOrders.length,
      averagePrepTimeMinutes: 13.8,
      rating: 4.92,
      reviewCount: 1240,
    };
  }
}
