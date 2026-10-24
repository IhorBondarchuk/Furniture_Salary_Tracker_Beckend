import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(64).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('worker', 'admin').default('worker'),
  adminCode: Joi.when('role', {
    is: 'admin',
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
