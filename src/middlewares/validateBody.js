import { HttpError } from '../utils/HttpError.js';

export const validateBody = schema => {
  return (req, res, next) => {
    // Express 5 leaves req.body undefined when there is no body, and Joi treats
    // undefined as valid — validate an empty object so required fields are enforced.
    const { error, value } = schema.validate(req.body ?? {});
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
    // Express 5 re-parses req.query from the URL on every access, so the
    // validated/converted values can't be written back — expose them separately.
    req.validatedQuery = value;
    next();
  };
};
