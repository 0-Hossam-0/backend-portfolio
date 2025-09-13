import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './database/connect';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import projectRoutes from './routes/project.route';
import experienceRoutes from './routes/experience.route';
import session from 'express-session';
import contactInfoRoutes from './routes/contact.route';
import userRoutes from './routes/user.route';
import updateRoutes from './routes/update.route';
import personalRoutes from './routes/personal.route';
import { limiter } from './middlewares/rateLimiter.middleware';
import { downloadCV } from './middlewares/cv.middleware';
import { corsMiddleware } from './middlewares/cors.middleware';

const app = express();

dotenv.config();

app.set('trust proxy', 1);

app.use(corsMiddleware);

// app.use(limiter);

const port = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

connectDB();

app.listen(port, () => console.log('Server Is Running on Port', port));

app.use(
  session({
    secret: process.env.SECRET_KEY || 'MyKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    },
  })
);

app.use('/images', express.static('../images'));

app.use('/api/project', projectRoutes);

app.use('/api/experience', experienceRoutes);

app.use('/api/contact', contactInfoRoutes);

app.use('/api/update', updateRoutes);

app.use('/api/user', userRoutes);

app.use('/api/personal', personalRoutes);

app.use('/api/download', downloadCV);

app.use((err: ErrorRequestHandler | any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    const flattened = err.flatten();
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: flattened.fieldErrors,
    });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: err.message || 'Something went wrong.',
  });
});

export default app;
