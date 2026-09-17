import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InMemoryDbService } from '../../database/in-memory-db.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import { OrderEntity } from '../../database/entities.js';
import { OrderStatus } from '../../common/enums/order-status.enum.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly db: InMemoryDbService,
  ) {}


  createOrder(dto: CreateOrderDto, customer: { id: string; name: string; phoneNumber?: string }): OrderEntity {
    const restaurant = this.db.getRestaurantById(dto.restaurantId);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant "${dto.restaurantId}" not found`);
    }

    if (!restaurant.isOpen || !restaurant.isAcceptingOrders) {
      throw new BadRequestException('Restaurant is currently offline or not accepting orders');
    }

    // Calculate financials
    let subtotal = 0;
    for (const item of dto.items) {
      let itemPrice = item.price * item.quantity;
      if (item.selectedOptions) {
        for (const opt of item.selectedOptions) {
          itemPrice += (opt.price || 0) * item.quantity;
        }
      }
      subtotal += itemPrice;
    }

    let discount = 0;
    if (dto.promoCode) {
      const promo = this.db.getPromotionByCode(dto.promoCode);
      if (promo && subtotal >= promo.minOrderAmount) {
        if (promo.discountPercent > 0) {
          discount = Number(((subtotal * promo.discountPercent) / 100).toFixed(2));
        } else if (promo.discountAmount) {
          discount = promo.discountAmount;
        }
        promo.usageCount++;
      }
    }

    const deliveryFee = restaurant.deliveryFee || 0;
    const tax = Number(((subtotal - discount) * 0.12).toFixed(2)); // 12% standard food tax
    const tip = dto.tip || 0;
    const total = Number((subtotal - discount + deliveryFee + tax + tip).toFixed(2));

    const orderNumber = `#SNB-${Math.floor(Math.random() * 8999 + 1000)}`;

    const newOrder: OrderEntity = {
      id: `ord-${Date.now().toString(36)}`,
      orderNumber,
      customerId: customer.id,
      customerName: customer.name || 'Sofia Lindqvist',
      customerPhone: customer.phoneNumber || '+25163480570',
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      items: dto.items,
      subtotal: Number(subtotal.toFixed(2)),
      deliveryFee,
      tax,
      tip,
      discount,
      total,
      status: OrderStatus.PENDING,
      prepTimeMinutes: restaurant.prepTimeDefault || 15,
      deliveryAddress: dto.deliveryAddress,
      dropOffNote: dto.dropOffNote,
      destinationLat: restaurant.lat + 0.008,
      destinationLng: restaurant.lng + 0.004,
      timeline: [
        {
          status: OrderStatus.PENDING,
          timestamp: new Date(),
          note: 'Order submitted by customer',
        },
      ],
      paymentMethod: dto.paymentMethod || 'Credit Card',
      isPaid: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.db.createOrder(newOrder);
  }

  getOrderById(id: string): OrderEntity {
    const order = this.db.getOrderById(id);
    if (!order) {
      throw new NotFoundException(`Order "${id}" not found`);
    }
    return order;
  }

  getTracking(id: string) {
    const order = this.getOrderById(id);
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      estimatedDeliveryMinutes: order.status === OrderStatus.DELIVERED ? 0 : 16,
      courier: order.courierName
        ? {
            name: order.courierName,
            phone: order.courierPhone,
            vehicle: 'E-Bike',
            rating: 4.96,
            currentCoordinates: {
              lat: order.currentLat || 59.334,
              lng: order.currentLng || 18.062,
            },
          }
        : null,
      destination: {
        address: order.deliveryAddress,
        coordinates: {
          lat: order.destinationLat,
          lng: order.destinationLng,
        },
      },
      timeline: order.timeline,
    };
  }

  getCustomerOrders(customerId: string): OrderEntity[] {
    return this.db.getOrdersByCustomer(customerId);
  }

  getRestaurantOrders(restaurantId: string): OrderEntity[] {
    return this.db.getOrdersByRestaurant(restaurantId);
  }

  acceptOrder(id: string, prepTimeMinutes: number = 15): OrderEntity {
    const updated = this.db.updateOrderStatus(id, OrderStatus.PREPARING, {
      prepTimeMinutes,
      note: `Kitchen accepted with ${prepTimeMinutes}m prep time`,
    });
    if (!updated) {
      throw new NotFoundException(`Order "${id}" not found`);
    }
    return updated;
  }

  rejectOrder(id: string): OrderEntity {
    const updated = this.db.updateOrderStatus(id, OrderStatus.CANCELLED, {
      note: 'Kitchen declined order due to capacity',
    });
    if (!updated) {
      throw new NotFoundException(`Order "${id}" not found`);
    }
    return updated;
  }

  markReady(id: string): OrderEntity {
    const updated = this.db.updateOrderStatus(id, OrderStatus.READY_FOR_PICKUP, {
      note: 'Order bagged and ready at counter',
    });
    if (!updated) {
      throw new NotFoundException(`Order "${id}" not found`);
    }
    return updated;
  }

  getKanban() {
    const orders = this.db.getOrders();
    return {
      incoming: orders.filter((o) => o.status === OrderStatus.PENDING),
      cooking: orders.filter((o) => o.status === OrderStatus.PREPARING || o.status === OrderStatus.ACCEPTED),
      ready: orders.filter((o) => o.status === OrderStatus.READY_FOR_PICKUP),
      transit: orders.filter((o) => o.status === OrderStatus.IN_TRANSIT || o.status === OrderStatus.PICKED_UP),
      completed: orders.filter((o) => o.status === OrderStatus.DELIVERED),
    };
  }
}
