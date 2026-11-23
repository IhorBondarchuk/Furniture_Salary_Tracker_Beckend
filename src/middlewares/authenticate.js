import { HttpError } from '../utils/HttpError.js';
import { verifyToken } from '../services/authServices.js';

export const authenticate = (req, res, next) => {
  const { authorization = '' } = req.headers;
  const [bearer, token] = authorization.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Not authorized'));
  }

  try {
    verifyToken(token);
    next();
  } catch {
    next(new HttpError(401, 'Not authorized'));
  }
};
