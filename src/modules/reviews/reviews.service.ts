import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryDbService } from '../../database/in-memory-db.service.js';
import { ReviewEntity } from '../../database/entities.js';

@Injectable()
export class ReviewsService {
  constructor(private db: InMemoryDbService) {}

  getReviews(restaurantId: string): ReviewEntity[] {
    return this.db.getReviews(restaurantId);
  }

  createReview(
    restaurantId: string,
    customer: { id: string; name: string },
    rating: number,
    comment: string,
  ): ReviewEntity {
    const newRev: ReviewEntity = {
      id: `rev-${Date.now().toString(36)}`,
      restaurantId,
      customerId: customer.id,
      customerName: customer.name,
      rating: Math.min(5, Math.max(1, rating)),
      comment,
      createdAt: new Date(),
    };
    return this.db.addReview(newRev);
  }

  replyToReview(reviewId: string, reply: string): ReviewEntity {
    const updated = this.db.replyToReview(reviewId, reply);
    if (!updated) {
      throw new NotFoundException(`Review "${reviewId}" not found`);
    }
    return updated;
  }
}
