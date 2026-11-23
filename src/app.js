import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { authRouter } from './routers/authRouter.js';
import { furnitureRouter } from './routers/furnitureRouter.js';
import { workEntryRouter } from './routers/workEntryRouter.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { authenticate } from './middlewares/authenticate.js';
import { assertAuthConfigured } from './services/authServices.js';

assertAuthConfigured();

const app = express();

// Single account: POST /api/auth/login exchanges APP_LOGIN/APP_PASSWORD for a
// bearer token that every other route requires. FRONTEND_URL optionally limits
// which browser origins may call the API; native mobile clients ignore CORS.
const { FRONTEND_URL } = process.env;

// Render sits behind a proxy: req.ip must be the client for the login rate limit
app.set('trust proxy', 1);
app.use(morgan('tiny'));
app.use(cors({ origin: FRONTEND_URL || true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/furniture', authenticate, furnitureRouter);
app.use('/api/work-entries', authenticate, workEntryRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
