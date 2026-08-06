import { isValidObjectId } from 'mongoose';
import { HttpError } from '../utils/HttpError.js';

export const isValidId = (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new HttpError(400, `${id} is not a valid id`));
  }
  next();
};
