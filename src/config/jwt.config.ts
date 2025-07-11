import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();

export default registerAs('jwt', () => {
  return {
    secret: process.env.JWT_SECRET,
    audience: process.env.JWT_AUD,
    issuer: process.env.JWT_ISSUER,
    expiresIn: parseInt(process.env.JWT_TTL ?? '3600', 10),
  };
});
