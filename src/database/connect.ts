import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION;

export async function connectDB() {
  if ((global as any).mongooseConn) {
    return (global as any).mongooseConn;
  }

  console.log('Connecting To Database...');
  const conn = await mongoose.connect(DB_CONNECTION!);

  (global as any).mongooseConn = conn;

  const db = mongoose.connection.db; // <-- safer than conn.connection.db
  if (!db) {
    throw new Error('Database connection is not ready yet');
  }

  (global as any).gfsBucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'uploads',
  });

  console.log('Database is connected successfully.');
  return conn;
}


export function getGridFSBucket(): mongoose.mongo.GridFSBucket {
  const bucket = (global as any).gfsBucket;
  if (!bucket) {
    throw new Error('GridFSBucket is not initialized. Call connectDB() first.');
  }
  return bucket;
}