import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extrai o userId do JWT token
 * Uso: @CurrentUser() userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);
