import Joi from 'joi';

export const loginSchema = Joi.object({
  login: Joi.string().trim().required(),
  password: Joi.string().required(),
});
