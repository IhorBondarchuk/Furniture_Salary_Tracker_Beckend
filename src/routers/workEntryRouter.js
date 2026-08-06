import { Router } from 'express';
import { workEntryControllers } from '../controllers/workEntryControllers.js';
import { authenticate } from '../middlewares/authenticate.js';
import { isValidId } from '../middlewares/isValidId.js';
import { validateBody, validateQuery } from '../middlewares/validateBody.js';
import {
  createWorkEntrySchema,
  updateWorkEntrySchema,
  salaryQuerySchema,
} from '../schemas/workEntrySchemas.js';

export const workEntryRouter = Router();

workEntryRouter.use(authenticate);

workEntryRouter.get('/salary', validateQuery(salaryQuerySchema), workEntryControllers.getSalary);

workEntryRouter.get('/', workEntryControllers.getAll);
workEntryRouter.get('/:id', isValidId, workEntryControllers.getById);

workEntryRouter.post(
  '/',
  validateBody(createWorkEntrySchema),
  workEntryControllers.create,
);
workEntryRouter.patch(
  '/:id',
  isValidId,
  validateBody(updateWorkEntrySchema),
  workEntryControllers.update,
);
workEntryRouter.delete('/:id', isValidId, workEntryControllers.remove);
