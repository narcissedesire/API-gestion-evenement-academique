import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/config/jwt.config';
import { AccessTokenGuard } from './access-token/access-token.guard';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './authorisation/guard/role/role.guard';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class IamModule {}
