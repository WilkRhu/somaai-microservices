import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface ValidatedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
}

@Injectable()
export class AuthValidationService {
  private readonly logger = new Logger(AuthValidationService.name);

  constructor(private jwtService: JwtService) {}

  async validateToken(token: string): Promise<ValidatedUser> {
    try {
      const decoded = this.jwtService.verify(token);
      return {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        isActive: decoded.isActive,
      };
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    return parts[1];
  }
}
