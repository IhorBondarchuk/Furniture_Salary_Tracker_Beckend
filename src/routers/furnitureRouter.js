import { Router } from 'express';
import { furnitureControllers } from '../controllers/furnitureControllers.js';
import { isValidId } from '../middlewares/isValidId.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createFurnitureSchema,
  updateFurnitureSchema,
} from '../schemas/furnitureSchemas.js';

export const furnitureRouter = Router();

furnitureRouter.get('/', furnitureControllers.getAll);
furnitureRouter.get('/:id', isValidId, furnitureControllers.getById);

furnitureRouter.post(
  '/',
  validateBody(createFurnitureSchema),
  furnitureControllers.create,
);
furnitureRouter.patch(
  '/:id',
  isValidId,
  validateBody(updateFurnitureSchema),
  furnitureControllers.update,
);
furnitureRouter.delete('/:id', isValidId, furnitureControllers.remove);
