import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { role } from 'src/decorators/role.decorator';
import { utilisateurType } from 'src/utilisateur/model/utilisateur.model';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctxRole = this.reflector.getAllAndOverride<utilisateurType[]>(role, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!ctxRole) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request['user'];
    console.log('user : ', user);

    return ctxRole.some((role) => user.type === role);
  }
}
