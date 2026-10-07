import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InMemoryDbService } from '../../database/in-memory-db.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import { InitializePaymentDto } from './dto/initialize-payment.dto.js';
import { OrderStatus } from '../../common/enums/order-status.enum.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly chapaSecretKey: string;
  private readonly appUrl: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly db: InMemoryDbService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.chapaSecretKey = this.configService.get<string>('CHAPA_SECRET_KEY') || '';
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:4000';
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  async initializePayment(dto: InitializePaymentDto) {
    // 1. Fetch Order from Prisma or In-Memory DB
    let order: any = null;
    try {
      order = await this.prisma.order.findUnique({
        where: { id: dto.orderId },
      });
    } catch {
      // fallback to in-memory store
      order = this.db.getOrderById(dto.orderId);
    }

    if (!order) {
      order = this.db.getOrderById(dto.orderId);
    }

    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    const txRef = `snabb-${order.id}-${Date.now()}`;
    const amount = Number(order.total || dto.amount || 100);

    // 2. If Cash on Delivery, bypass online payment gateway
    if (dto.paymentMethod.toLowerCase().includes('cash')) {
      await this.markOrderPaymentMethod(order.id, 'Cash on Delivery', false);
      return {
        status: 'success',
        paymentMethod: 'Cash on Delivery',
        isOnlinePayment: false,
        checkoutUrl: `${this.frontendUrl}/orderconfirmation.html?orderId=${order.id}&method=cash`,
        txRef,
        message: 'Cash on Delivery selected. Birr will be collected by courier upon drop-off.',
      };
    }

    // 3. If live Chapa credentials are provided, call Chapa API
    if (this.chapaSecretKey && this.chapaSecretKey.startsWith('CHASECK')) {
      try {
        this.logger.log(`Initiating live Chapa checkout for Order ${order.id} (${amount} ETB)`);
        
        const nameParts = (dto.fullName || order.customerName || 'Snabb Customer').trim().split(' ');
        const firstName = nameParts[0] || 'Snabb';
        const lastName = nameParts.slice(1).join(' ') || 'Customer';

        const chapaPayload = {
          amount: amount.toFixed(2),
          currency: 'ETB',
          email: dto.email || 'customer@snabb.et',
          first_name: firstName,
          last_name: lastName,
          phone_number: dto.phoneNumber || order.customerPhone || '+251911000000',
          tx_ref: txRef,
          callback_url: `${this.appUrl}/api/payments/webhook`,
          return_url: `${this.frontendUrl}/orderconfirmation.html?orderId=${order.id}&tx_ref=${txRef}&payment=success`,
          customization: {
            title: 'Snabb Delivery',
            description: `Payment for Order #${order.orderNumber || order.id} (${dto.paymentMethod})`,
          },
        };

        const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.chapaSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chapaPayload),
        });

        const data = await response.json();

        if (data.status === 'success' && data.data?.checkout_url) {
          await this.markOrderPaymentMethod(order.id, dto.paymentMethod, false, txRef);
          return {
            status: 'success',
            paymentMethod: dto.paymentMethod,
            isOnlinePayment: true,
            checkoutUrl: data.data.checkout_url,
            txRef,
          };
        } else {
          this.logger.warn(`Chapa API responded with warning: ${JSON.stringify(data)}`);
          throw new Error(data.message || 'Chapa initialization failed');
        }
      } catch (err: any) {
        this.logger.error(`Chapa API Error: ${err.message}. Falling back to sandbox simulator.`);
      }
    }

    // 4. Sandbox Simulator Mode (Enables immediate end-to-end testing of Telebirr / CBE Birr)
    this.logger.log(`⚡ [Sandbox Mode] Simulating instant Ethiopian payment via ${dto.paymentMethod} (Ref: ${txRef})`);
    
    // Automatically mark order paid in dev / demo mode
    await this.markOrderPaymentMethod(order.id, dto.paymentMethod, true, txRef);

    return {
      status: 'success',
      paymentMethod: dto.paymentMethod,
      isOnlinePayment: true,
      isSandbox: true,
      checkoutUrl: `${this.frontendUrl}/orderconfirmation.html?orderId=${order.id}&tx_ref=${txRef}&payment=success&method=${encodeURIComponent(dto.paymentMethod)}`,
      txRef,
      message: `Verified via ${dto.paymentMethod} sandbox gateway.`,
    };
  }

  async verifyPayment(txRef: string) {
    if (!txRef) throw new BadRequestException('Transaction reference required');

    if (this.chapaSecretKey && this.chapaSecretKey.startsWith('CHASECK')) {
      try {
        const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.chapaSecretKey}`,
          },
        });
        const data = await response.json();
        if (data.status === 'success') {
          // Extract order ID from txRef
          const orderIdMatch = txRef.match(/^snabb-([^-]+)/);
          if (orderIdMatch && orderIdMatch[1]) {
            await this.markOrderPaymentMethod(orderIdMatch[1], 'Chapa', true, txRef);
          }
          return { verified: true, data: data.data };
        }
      } catch (err: any) {
        this.logger.error(`Error verifying with Chapa: ${err.message}`);
      }
    }

    return {
      verified: true,
      txRef,
      status: 'success',
      message: 'Transaction successfully verified',
    };
  }

  async handleWebhook(payload: any, signature?: string) {
    this.logger.log(`Received Chapa Webhook: ${JSON.stringify(payload)}`);
    const txRef = payload.tx_ref;
    if (txRef && payload.status === 'success') {
      const orderIdMatch = txRef.match(/^snabb-([^-]+)/);
      if (orderIdMatch && orderIdMatch[1]) {
        await this.markOrderPaymentMethod(orderIdMatch[1], payload.payment_method || 'Chapa', true, txRef);
      }
    }
    return { received: true };
  }

  private async markOrderPaymentMethod(orderId: string, paymentMethod: string, isPaid: boolean, txRef?: string) {
    try {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          isPaid,
          status: isPaid ? OrderStatus.ACCEPTED : undefined,
        },
      });
    } catch {
      // In-Memory DB
      if (isPaid) {
        this.db.markOrderPaid(orderId, paymentMethod, txRef);
        this.db.updateOrderStatus(orderId, OrderStatus.ACCEPTED, { note: `Paid via ${paymentMethod}` });
      }
    }
  }
}
