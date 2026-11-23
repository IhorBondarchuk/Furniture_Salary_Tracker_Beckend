import { createHash, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/HttpError.js';

// A single account: credentials live only in the environment, never in the repo.
const { APP_LOGIN, APP_PASSWORD, JWT_SECRET } = process.env;
const TOKEN_TTL = '30d';

// Hashing first gives equal-length buffers, so timingSafeEqual never throws
// and the comparison doesn't leak the expected length.
const safeEqual = (a, b) =>
  timingSafeEqual(
    createHash('sha256').update(a).digest(),
    createHash('sha256').update(b).digest(),
  );

export const assertAuthConfigured = () => {
  if (!APP_LOGIN || !APP_PASSWORD || !JWT_SECRET) {
    throw new Error('APP_LOGIN, APP_PASSWORD and JWT_SECRET must be set');
  }
};

export const login = ({ login, password }) => {
  // evaluate both so a wrong login takes as long as a wrong password
  const loginOk = safeEqual(login, APP_LOGIN);
  const passwordOk = safeEqual(password, APP_PASSWORD);
  if (!loginOk || !passwordOk) {
    throw new HttpError(401, 'Wrong login or password');
  }
  return { token: jwt.sign({ sub: APP_LOGIN }, JWT_SECRET, { expiresIn: TOKEN_TTL }) };
};

export const verifyToken = token => jwt.verify(token, JWT_SECRET);
