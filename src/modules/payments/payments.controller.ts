import { Controller, Post, Get, Body, Param, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { InitializePaymentDto } from './dto/initialize-payment.dto.js';

@ApiTags('Payments & Ethiopian Checkout Gateways')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initialize checkout payment with Chapa, Telebirr, CBE Birr, or Cash' })
  @ApiResponse({ status: 200, description: 'Returns checkout URL or direct confirmation redirect' })
  initializePayment(@Body() dto: InitializePaymentDto) {
    return this.paymentsService.initializePayment(dto);
  }

  @Get('verify/:txRef')
  @ApiOperation({ summary: 'Verify payment status with Chapa transaction reference' })
  verifyPayment(@Param('txRef') txRef: string) {
    return this.paymentsService.verifyPayment(txRef);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive instant payment status webhook from Chapa' })
  handleWebhook(
    @Body() payload: any,
    @Headers('x-chapa-signature') signature?: string,
  ) {
    return this.paymentsService.handleWebhook(payload, signature);
  }
}
