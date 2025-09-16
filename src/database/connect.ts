import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION;

let gfsBucket: mongoose.mongo.GridFSBucket | null = null;
let isConnected = false;

export async function connectDB() {
  console.log('Connection Status:', isConnected);
  console.log('gfs Bucket:', gfsBucket);
  if (isConnected && gfsBucket) return;

  console.log('Connecting To Database...');
  try {
    const conn = await mongoose.connect(DB_CONNECTION!);

    isConnected = true;
    console.log('Database is connected successfully.');

    gfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db!, {
      bucketName: 'uploads',
    });
    console.log('GridFS initialized with bucket name "uploads"');
  } catch (error) {
    console.error('Error connecting to DB:', error);
  }
}

export function getGridFSBucket(): mongoose.mongo.GridFSBucket {
  if (!gfsBucket) {
    throw new Error('GridFSBucket is not initialized. Call connectDB() first.');
  }
  return gfsBucket;
}
