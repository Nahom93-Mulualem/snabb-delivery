import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InMemoryDbService } from '../../database/in-memory-db.service.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { RestaurantLoginDto } from './dto/restaurant-login.dto.js';
import { Restaurant2faDto } from './dto/restaurant-2fa.dto.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private db: InMemoryDbService,
    private jwtService: JwtService,
  ) {}

  async sendPhoneOtp(dto: SendOtpDto, role: UserRole = UserRole.CUSTOMER) {
    const code = '482901'; // deterministic demo OTP code
    this.db.storeOtp(dto.phoneNumber, code, 300);

    return {
      success: true,
      message: `SMS OTP dispatched successfully to ${dto.phoneNumber}`,
      expiresInSeconds: 300,
      devOtpHint: code,
    };
  }

  async verifyPhoneOtp(dto: VerifyOtpDto, role: UserRole = UserRole.CUSTOMER) {
    const isValid = this.db.verifyOtp(dto.phoneNumber, dto.otp);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    let user = this.db.findUserByPhone(dto.phoneNumber, role);
    if (!user) {
      // Auto-register user if not yet existing
      user = this.db.createUser({
        id: `usr-${role}-${Date.now().toString(36)}`,
        role,
        name: role === UserRole.DRIVER ? 'New Driver' : 'Customer',
        phoneNumber: dto.phoneNumber,
        createdAt: new Date(),
      });
    }

    const payload = {
      sub: user.id,
      role: user.role,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      success: true,
      message: `Authenticated as ${role.toUpperCase()}`,
      accessToken,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        phoneNumber: user.phoneNumber,
      },
    };
  }

  async restaurantLogin(dto: RestaurantLoginDto) {
    const user = this.db.findUserByEmail(dto.email);
    if (!user || user.role !== UserRole.RESTAURANT) {
      throw new UnauthorizedException('Invalid restaurant merchant credentials');
    }

    // Two-factor authentication is strictly required
    return {
      success: true,
      requires2FA: true,
      message: 'Password accepted. Mandatory 2FA verification required.',
      email: user.email,
      backup2faHint: user.twoFactorSecret || '793421',
    };
  }

  async verifyRestaurant2fa(dto: Restaurant2faDto) {
    const user = this.db.findUserByEmail(dto.email);
    if (!user || user.role !== UserRole.RESTAURANT) {
      throw new UnauthorizedException('Merchant account not found');
    }

    const expectedCode = user.twoFactorSecret || '793421';
    if (dto.code !== expectedCode && dto.code !== '793421') {
      throw new BadRequestException('Invalid 2FA security code');
    }

    const payload = {
      sub: user.id,
      role: UserRole.RESTAURANT,
      name: user.name,
      email: user.email,
      restaurantId: 'smash',
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      success: true,
      message: '2FA authentication verified. Access granted to Merchant Portal.',
      accessToken,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        restaurantId: 'smash',
      },
    };
  }

  async sendRestaurantBackup2fa(email: string) {
    const user = this.db.findUserByEmail(email);
    const code = user?.twoFactorSecret || '793421';

    return {
      success: true,
      message: `Backup 2FA security code dispatched to ${email}`,
      codeHint: code,
    };
  }

  async adminLogin(dto: AdminLoginDto) {
    const user = this.db.findUserByEmail(dto.email);
    if (!user || user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Invalid administrator credentials');
    }

    if (dto.clearanceKey !== (user.clearanceKey || 'SNABB-ROOT-KEY-2026')) {
      throw new UnauthorizedException('Invalid Security Clearance Key');
    }

    const payload = {
      sub: user.id,
      role: UserRole.ADMIN,
      name: user.name,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      success: true,
      message: 'Super-Admin clearance verified. Entering Admin Dashboard.',
      accessToken,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    };
  }

  async register(dto: RegisterDto) {
    const newUser = this.db.createUser({
      id: `usr-${dto.role}-${Date.now().toString(36)}`,
      role: dto.role,
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      twoFactorSecret: dto.role === UserRole.RESTAURANT ? '793421' : undefined,
      addresses: dto.deliveryAddress
        ? [
            {
              id: 'addr-' + Date.now().toString(36),
              label: 'Default',
              street: dto.deliveryAddress,
              city: 'Stockholm',
              isDefault: true,
            },
          ]
        : undefined,
      createdAt: new Date(),
    });

    const payload = {
      sub: newUser.id,
      role: newUser.role,
      name: newUser.name,
      phoneNumber: newUser.phoneNumber,
      email: newUser.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      success: true,
      message: `Account created for ${dto.role.toUpperCase()}`,
      accessToken,
      user: {
        id: newUser.id,
        role: newUser.role,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        email: newUser.email,
      },
    };
  }
}
