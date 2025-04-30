import { Request } from 'express';

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const Request = context.switchToHttp().getRequest();
    console.log('rq', Request);
    return true;
  }
}
