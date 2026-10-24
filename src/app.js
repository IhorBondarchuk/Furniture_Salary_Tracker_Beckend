import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { authRouter } from './routers/authRouter.js';
import { furnitureRouter } from './routers/furnitureRouter.js';
import { workEntryRouter } from './routers/workEntryRouter.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// FRONTEND_URL restricts CORS to the deployed frontend in production;
// without it (e.g. local dev) any origin is reflected back.
const { FRONTEND_URL, NODE_ENV } = process.env;

// Reflecting any origin with credentials + a sameSite=none refresh cookie
// would let any site obtain access tokens — refuse to start like that.
if (NODE_ENV === 'production' && !FRONTEND_URL) {
  throw new Error('FRONTEND_URL must be set in production');
}

app.use(morgan('tiny'));
app.use(cors({ origin: FRONTEND_URL || true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/furniture', furnitureRouter);
app.use('/api/work-entries', workEntryRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
