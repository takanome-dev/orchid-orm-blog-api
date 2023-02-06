import jwt, { type JwtPayload } from 'jsonwebtoken';

import { config } from '@/config';

export const createToken = ({ id }: { id: number }): string => {
  return jwt.sign({ id }, config.JWT_SECRET);
};

export const verifyToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, config.JWT_SECRET);
};
