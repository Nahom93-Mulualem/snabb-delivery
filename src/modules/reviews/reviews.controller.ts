import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@ApiTags('Reviews & Ratings')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get customer reviews for a specific restaurant' })
  getReviews(@Param('restaurantId') restaurantId: string) {
    return this.reviewsService.getReviews(restaurantId);
  }

  @Post('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Customer submits a review and star rating' })
  createReview(
    @Param('restaurantId') restaurantId: string,
    @Body() body: { rating: number; comment: string },
    @Request() req: any,
  ) {
    const customer = req.user || { id: 'usr-customer-1', name: 'Sofia Lindqvist' };
    return this.reviewsService.createReview(restaurantId, customer, body.rating, body.comment);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Merchant posts an inline response to a customer review' })
  replyToReview(
    @Param('id') id: string,
    @Body() body: { reply: string },
  ) {
    return this.reviewsService.replyToReview(id, body.reply);
  }
}
