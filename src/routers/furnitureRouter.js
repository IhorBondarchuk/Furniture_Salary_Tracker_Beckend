import { Router } from 'express';
import { furnitureControllers } from '../controllers/furnitureControllers.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';
import { isValidId } from '../middlewares/isValidId.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createFurnitureSchema,
  updateFurnitureSchema,
} from '../schemas/furnitureSchemas.js';

export const furnitureRouter = Router();

furnitureRouter.use(authenticate);

furnitureRouter.get('/', furnitureControllers.getAll);
furnitureRouter.get('/:id', isValidId, furnitureControllers.getById);

furnitureRouter.post(
  '/',
  authorizeRole('admin'),
  validateBody(createFurnitureSchema),
  furnitureControllers.create,
);
furnitureRouter.patch(
  '/:id',
  authorizeRole('admin'),
  isValidId,
  validateBody(updateFurnitureSchema),
  furnitureControllers.update,
);
furnitureRouter.delete(
  '/:id',
  authorizeRole('admin'),
  isValidId,
  furnitureControllers.remove,
);
