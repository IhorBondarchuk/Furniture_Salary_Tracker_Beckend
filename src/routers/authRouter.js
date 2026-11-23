import { Router } from 'express';
import { authControllers } from '../controllers/authControllers.js';
import { loginRateLimit } from '../middlewares/loginRateLimit.js';
import { validateBody } from '../middlewares/validateBody.js';
import { loginSchema } from '../schemas/authSchemas.js';

export const authRouter = Router();

authRouter.post('/login', loginRateLimit, validateBody(loginSchema), authControllers.login);
