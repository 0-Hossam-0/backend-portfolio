import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION;

let gfsBucket: mongoose.mongo.GridFSBucket | null = (global as any).gfsBucket || null;
let isConnected: boolean = (global as any).isConnected || false;

export async function connectDB() {
  if ((global as any).mongooseConn) {
    return (global as any).mongooseConn;
  }

  console.log('Connecting To Database...');
  const conn = await mongoose.connect(DB_CONNECTION!);

  (global as any).mongooseConn = conn;
  (global as any).gfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db!, {
    bucketName: 'uploads',
  });

  console.log('Database is connected successfully.');
  return conn;
}

export function getGridFSBucket(): mongoose.mongo.GridFSBucket {
  if (!gfsBucket) {
    throw new Error('GridFSBucket is not initialized. Call connectDB() first.');
  }
  return gfsBucket;
}
