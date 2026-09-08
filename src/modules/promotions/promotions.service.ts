import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryDbService } from '../../database/in-memory-db.service.js';
import { PromotionEntity } from '../../database/entities.js';

@Injectable()
export class PromotionsService {
  constructor(private db: InMemoryDbService) {}

  getAll(): PromotionEntity[] {
    return this.db.getPromotions();
  }

  validateCode(code: string, subtotal: number) {
    const promo = this.db.getPromotionByCode(code);
    if (!promo) {
      throw new NotFoundException(`Promo code "${code}" is invalid or expired`);
    }

    if (subtotal < promo.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order of $${promo.minOrderAmount.toFixed(2)} required for this code.`,
        minOrderAmount: promo.minOrderAmount,
      };
    }

    let discount = 0;
    if (promo.discountPercent > 0) {
      discount = Number(((subtotal * promo.discountPercent) / 100).toFixed(2));
    } else if (promo.discountAmount) {
      discount = promo.discountAmount;
    }

    return {
      valid: true,
      code: promo.code,
      title: promo.title,
      discount,
      minOrderAmount: promo.minOrderAmount,
    };
  }

  create(data: Partial<PromotionEntity>): PromotionEntity {
    const newPromo: PromotionEntity = {
      id: `promo-${Date.now().toString(36)}`,
      code: (data.code || 'SPECIAL10').toUpperCase(),
      title: data.title || 'Special Promotion',
      description: data.description || '',
      discountPercent: data.discountPercent || 10,
      minOrderAmount: data.minOrderAmount || 15,
      active: true,
      usageCount: 0,
    };
    return this.db.addPromotion(newPromo);
  }
}
