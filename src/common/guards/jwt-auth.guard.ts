import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      // For development/demo convenience, if an x-user-role header is provided, mock the user
      const devRole = request.headers['x-user-role'];
      if (devRole) {
        request.user = {
          id: request.headers['x-user-id'] || 'dev-user-1',
          role: devRole,
          name: 'Demo ' + devRole,
          email: `${devRole}@snabb.io`,
          phoneNumber: '+25163480570',
        };
        return true;
      }
      throw new UnauthorizedException('Missing Authorization Header');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Token Format');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token is invalid or expired');
    }
  }
}
