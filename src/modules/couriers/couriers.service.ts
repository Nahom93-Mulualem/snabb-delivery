import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InMemoryDbService } from '../../database/in-memory-db.service.js';
import { CourierEntity } from '../../database/entities.js';
import { OrderStatus } from '../../common/enums/order-status.enum.js';

@Injectable()
export class CouriersService {
  constructor(private db: InMemoryDbService) {}

  getCourierProfile(id: string): CourierEntity {
    const courier = this.db.getCourierById(id);
    if (!courier) {
      throw new NotFoundException(`Courier with ID "${id}" not found`);
    }
    return courier;
  }

  updateDuty(id: string, isOnline: boolean): CourierEntity {
    const updated = this.db.updateCourierDuty(id, isOnline);
    if (!updated) {
      throw new NotFoundException(`Courier with ID "${id}" not found`);
    }
    return updated;
  }

  getAvailableRequests(courierId: string) {
    const courier = this.getCourierProfile(courierId);
    if (!courier.isOnline) {
      return [];
    }

    const availableOrders = this.db
      .getOrders()
      .filter((o) => (o.status === OrderStatus.READY_FOR_PICKUP || o.status === OrderStatus.PREPARING) && !o.courierId);

    return availableOrders.map((o) => ({
      orderId: o.id,
      orderNumber: o.orderNumber,
      restaurantName: o.restaurantName,
      pickupAddress: 'Kungsgatan 22, Stockholm',
      deliveryAddress: o.deliveryAddress,
      distanceKm: 1.2,
      estimatedMinutes: 14,
      payoutAmount: 8.5,
      tipAmount: o.tip || 2.0,
      itemCount: o.items.length,
      countdownSeconds: 30,
    }));
  }

  acceptDelivery(courierId: string, orderId: string) {
    const courier = this.getCourierProfile(courierId);
    const order = this.db.getOrderById(orderId);
    if (!order) {
      throw new NotFoundException(`Order "${orderId}" not found`);
    }

    if (order.courierId && order.courierId !== courier.id) {
      throw new BadRequestException('Order has already been claimed by another courier');
    }

    courier.activeOrderId = order.id;
    const updated = this.db.updateOrderStatus(orderId, OrderStatus.COURIER_ASSIGNED, {
      courierId: courier.id,
      note: `Courier ${courier.name} accepted delivery dispatch`,
    });

    return {
      success: true,
      message: 'Delivery request accepted',
      order: updated,
      courier,
    };
  }

  updateStep(courierId: string, orderId: string, step: 'arrived' | 'picked_up' | 'on_the_way' | 'delivered') {
    const courier = this.getCourierProfile(courierId);
    const order = this.db.getOrderById(orderId);
    if (!order) {
      throw new NotFoundException(`Order "${orderId}" not found`);
    }

    let nextStatus = order.status;
    let note = '';

    if (step === 'arrived') {
      note = 'Courier arrived at restaurant pickup counter';
    } else if (step === 'picked_up') {
      nextStatus = OrderStatus.PICKED_UP;
      note = 'Order picked up by courier';
    } else if (step === 'on_the_way') {
      nextStatus = OrderStatus.IN_TRANSIT;
      note = 'Courier in transit to customer drop-off';
    } else if (step === 'delivered') {
      nextStatus = OrderStatus.DELIVERED;
      note = 'Order successfully delivered to customer';
      courier.completedDeliveries++;
      courier.earningsToday += 8.5;
      courier.tipsToday += order.tip || 2.0;
      courier.activeOrderId = undefined;
    }

    const updated = this.db.updateOrderStatus(orderId, nextStatus, { note });
    return { success: true, step, order: updated };
  }

  getEarnings(courierId: string) {
    const courier = this.getCourierProfile(courierId);
    return {
      courierId: courier.id,
      name: courier.name,
      completedToday: 6,
      earningsToday: courier.earningsToday,
      tipsToday: courier.tipsToday,
      totalToday: courier.earningsToday + courier.tipsToday,
      weeklySummary: {
        totalEarnings: 684.2,
        tripsCount: 42,
        onlineHours: 24.5,
        rating: courier.rating,
      },
      recentTrips: [
        { id: 'trip-1', orderNumber: '#SNB-9482', time: '14:20', payout: 11.5, tip: 3.0 },
        { id: 'trip-2', orderNumber: '#SNB-8812', time: '13:05', payout: 9.0, tip: 2.5 },
        { id: 'trip-3', orderNumber: '#SNB-7491', time: '12:15', payout: 14.0, tip: 4.0 },
      ],
    };
  }

  updateLocation(courierId: string, lat: number, lng: number) {
    const updated = this.db.updateCourierLocation(courierId, lat, lng);
    return { success: true, coordinates: { lat, lng } };
  }
}
