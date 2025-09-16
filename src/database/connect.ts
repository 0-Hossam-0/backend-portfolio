import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION;

let mongoosePromise: Promise<typeof mongoose> | null = null;

export async function connectDB() {
  if ((global as any).mongooseConn) {
    return (global as any).mongooseConn;
  }

  if (!mongoosePromise) {
    console.log('Connecting To Database...');
    mongoosePromise = mongoose.connect(DB_CONNECTION!, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // more tolerant on cold starts
    });
  }

  const conn = await mongoosePromise;

  (global as any).mongooseConn = conn;

  if (!(global as any).gfsBucket) {
    const db = conn.connection.db;
    (global as any).gfsBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads',
    });
    console.log('GridFS initialized');
  }

  return conn;
}

export function getGridFSBucket(): mongoose.mongo.GridFSBucket {
  const bucket = (global as any).gfsBucket;
  if (!bucket) {
    throw new Error('GridFSBucket is not initialized. Call connectDB() first.');
  }
  return bucket;
}