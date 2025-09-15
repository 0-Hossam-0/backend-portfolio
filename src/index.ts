import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import dotenv from 'dotenv';
import { connectDB, getGridFSBucket } from './database/connect';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import projectRoutes from './routes/project.route';
import experienceRoutes from './routes/experience.route';
import session from 'express-session';
import contactInfoRoutes from './routes/contact.route';
import userRoutes from './routes/user.route';
import updateRoutes from './routes/update.route';
import personalRoutes from './routes/personal.route';
import { downloadCV } from './middlewares/cv.middleware';
import { corsMiddleware } from './middlewares/cors.middleware';
import { getAllData } from './middlewares/user.middleware';
import mongoose from 'mongoose';
import MongoStore  from 'connect-mongo';

const app = express();

dotenv.config();

app.set('trust proxy', 1);

app.use(corsMiddleware);

// app.use(limiter);

const port = process.env.PORT || 4000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

connectDB();

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_CONNECTION,
      dbName: 'sessions',
    }),
    cookie: {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.listen(port, () => console.log('Server Is Running on Port', port));

app.get('/images/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const bucket = getGridFSBucket();

    // Make sure the file exists first
    const files = await mongoose.connection.db!
      .collection('uploads.files') // 👈 must match bucketName
      .find({ _id: fileId })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.setHeader('Content-Type', files[0].contentType || 'application/octet-stream');

    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).json({ message: 'Error streaming image' });
    });

    downloadStream.pipe(res);
  } catch (err) {
    res.status(400).json({ message: 'Invalid image id' });
  }
});


app.use('/api/project', projectRoutes);

app.use('/api/experience', experienceRoutes);

app.use('/api/contact', contactInfoRoutes);

app.use('/api/update', updateRoutes);

app.use('/api/user', userRoutes);

app.use('/api/personal', personalRoutes);

app.use('/api/download', downloadCV);

app.get('/api/home', getAllData);

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
