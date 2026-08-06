import Joi from 'joi';

export const createFurnitureSchema = Joi.object({
  name: Joi.string().min(2).max(128).required(),
  price: Joi.number().min(0).required(),
});

export const updateFurnitureSchema = Joi.object({
  name: Joi.string().min(2).max(128),
  price: Joi.number().min(0),
}).min(1);
