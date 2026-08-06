import Joi from 'joi';

export const createWorkEntrySchema = Joi.object({
  furniture: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
  date: Joi.date().iso(),
  worker: Joi.string().hex().length(24),
});

export const updateWorkEntrySchema = Joi.object({
  furniture: Joi.string().hex().length(24),
  quantity: Joi.number().integer().min(1),
  date: Joi.date().iso(),
}).min(1);

export const salaryQuerySchema = Joi.object({
  worker: Joi.string().hex().length(24),
  from: Joi.date().iso().required(),
  to: Joi.date().iso().min(Joi.ref('from')).required(),
});
