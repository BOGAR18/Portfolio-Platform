import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from '../server/routes/auth';
import { errorHandler } from '../server/middleware/errorHandler';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use(errorHandler);

export default app;