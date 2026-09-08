import { Controller, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { RestaurantLoginDto } from './dto/restaurant-login.dto.js';
import { Restaurant2faDto } from './dto/restaurant-2fa.dto.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('Authentication & Role Gateways')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 1. Customer: Phone + OTP
  @Post('phone/send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send 6-digit SMS OTP to Customer mobile phone' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  sendCustomerOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendPhoneOtp(dto, UserRole.CUSTOMER);
  }

  @Post('phone/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Customer SMS OTP and receive JWT access token' })
  verifyCustomerOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyPhoneOtp(dto, UserRole.CUSTOMER);
  }

  // 2. Driver: Phone + OTP
  @Post('driver/send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send 6-digit SMS OTP to Driver mobile phone' })
  sendDriverOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendPhoneOtp(dto, UserRole.DRIVER);
  }

  @Post('driver/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Driver SMS OTP and receive JWT access token' })
  verifyDriverOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyPhoneOtp(dto, UserRole.DRIVER);
  }

  // 3. Restaurant: Email + Password + Mandatory 2FA
  @Post('restaurant/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restaurant merchant credential check (triggers mandatory 2FA challenge)' })
  restaurantLogin(@Body() dto: RestaurantLoginDto) {
    return this.authService.restaurantLogin(dto);
  }

  @Post('restaurant/verify-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Restaurant mandatory 2FA code and receive Merchant Portal token' })
  verifyRestaurant2fa(@Body() dto: Restaurant2faDto) {
    return this.authService.verifyRestaurant2fa(dto);
  }

  @Post('restaurant/backup-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dispatch backup 2FA code to merchant registered email' })
  sendRestaurantBackupCode(@Query('email') email: string) {
    return this.authService.sendRestaurantBackup2fa(email || 'owner@smashanddash.se');
  }

  // 4. Admin: Clearance Key
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Platform Super-Admin authentication with clearance key' })
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto);
  }

  // 5. Universal Registration
  @Post('register')
  @ApiOperation({ summary: 'Multi-role application & registration (Customer, Driver, Restaurant, Admin)' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
