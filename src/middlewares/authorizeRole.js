import { HttpError } from '../utils/HttpError.js';

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new HttpError(403, 'Access denied'));
    }
    next();
  };
};
