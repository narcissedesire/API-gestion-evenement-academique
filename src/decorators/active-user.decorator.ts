export const IsPublic = 'isPublic';

import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

export const ActiveUser = createParamDecorator(
  (field: String | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request['user'];
    return field ? '' : user;
  },
);

export const Public = () => SetMetadata(IsPublic, true);
