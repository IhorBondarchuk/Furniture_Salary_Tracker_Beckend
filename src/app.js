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

app.use(morgan('tiny'));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/furniture', furnitureRouter);
app.use('/api/work-entries', workEntryRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
