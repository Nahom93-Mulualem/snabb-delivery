import { Injectable } from '@nestjs/common';
import { InMemoryDbService } from '../../database/in-memory-db.service.js';

@Injectable()
export class AdminService {
  constructor(private db: InMemoryDbService) {}

  getPlatformMetrics() {
    const orders = this.db.getOrders();
    const gmv = orders.reduce((sum, o) => sum + o.total, 0);
    const completedOrders = orders.filter((o) => o.status === 'DELIVERED');
    const couriers = this.db.getCouriers();
    const restaurants = this.db.getRestaurants();

    return {
      grossMerchandiseVolume: Number(gmv.toFixed(2)),
      platformCommissionEarned: Number((gmv * 0.18).toFixed(2)),
      totalOrdersCount: orders.length,
      completionRatePercent: orders.length ? Number(((completedOrders.length / orders.length) * 100).toFixed(1)) : 100,
      activeCouriersOnline: couriers.filter((c) => c.isOnline).length,
      totalCouriersCount: couriers.length,
      activeRestaurantsCount: restaurants.filter((r) => r.isOpen).length,
      totalRestaurantsCount: restaurants.length,
      averageDeliveryMinutes: 19.4,
      disputeCount: 2,
    };
  }

  getUsersList() {
    return this.db.getAllUsers().map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      phoneNumber: u.phoneNumber || 'N/A',
      email: u.email || 'N/A',
      createdAt: u.createdAt,
      status: 'ACTIVE',
    }));
  }

  getEscrowPayments() {
    const orders = this.db.getOrders();
    return orders.map((o) => ({
      id: `tx-${o.id}`,
      orderId: o.id,
      orderNumber: o.orderNumber,
      customer: o.customerName,
      restaurant: o.restaurantName,
      grossAmount: o.total,
      restaurantPayout: Number((o.subtotal * 0.82).toFixed(2)),
      courierPayout: 8.5 + (o.tip || 0),
      platformFee: Number((o.total * 0.15).toFixed(2)),
      status: o.status === 'DELIVERED' ? 'SETTLED' : 'HELD_IN_ESCROW',
      timestamp: o.createdAt,
    }));
  }

  getDispatchLocations() {
    return [
      {
        id: 'loc-1',
        city: 'Stockholm',
        zone: 'Central & Vasastan',
        activeDrivers: 18,
        activeOrders: 14,
        status: 'HIGH_DEMAND',
      },
      {
        id: 'loc-2',
        city: 'Stockholm',
        zone: 'Södermalm',
        activeDrivers: 12,
        activeOrders: 8,
        status: 'NORMAL',
      },
      {
        id: 'loc-3',
        city: 'Addis Ababa',
        zone: 'Bole Subcity',
        activeDrivers: 24,
        activeOrders: 19,
        status: 'HIGH_DEMAND',
      },
      {
        id: 'loc-4',
        city: 'Addis Ababa',
        zone: 'Kazanchis & Kirkos',
        activeDrivers: 15,
        activeOrders: 11,
        status: 'NORMAL',
      },
    ];
  }
}
