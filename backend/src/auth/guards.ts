import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';

  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {}

  @Injectable()
  export class MaintainerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const { user } = context.switchToHttp().getRequest();
      if (!user?.isMaintainer) {
        throw new ForbiddenException('Maintainer role required');
      }
      return true;
    }
  }

  @Injectable()
  export class OptionalJwtGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any) {
      return user || null;
    }
  }