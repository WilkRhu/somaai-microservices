import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new HttpException('User not found in request', HttpStatus.UNAUTHORIZED);
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
