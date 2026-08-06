import { HttpError } from '../utils/HttpError.js';

export const validateBody = schema => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return next(new HttpError(400, error.message));
    }
    req.body = value;
    next();
  };
};

export const validateQuery = schema => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    if (error) {
      return next(new HttpError(400, error.message));
    }
    // Express 5 exposes req.query as a getter-only property, so mutate
    // in place instead of reassigning.
    Object.assign(req.query, value);
    next();
  };
};
