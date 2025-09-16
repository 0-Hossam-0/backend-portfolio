import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION;

let gfsBucket: mongoose.mongo.GridFSBucket | null = null;
let isConnected = false;

export async function connectDB() {
  if (isConnected && gfsBucket) {
    return;
  }

  console.log('Connecting To Database...');
  try {
    const conn = await mongoose.connect(DB_CONNECTION!, {
      bufferCommands: false,
    });

    // ✅ wait until fully ready, with timeout (10s)
    await Promise.race([
      conn.connection.asPromise(), // resolves on "open"
      new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB connection timeout')), 10000)),
    ]);

    const db = conn.connection.db;
    if (!db) {
      throw new Error('Database is not ready');
    }

    gfsBucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
    isConnected = true;

    console.log('Database connected + GridFS ready.');
  } catch (error) {
    console.error('Error connecting to DB:', error);
    throw error;
  }
}

export function getGridFSBucket(): mongoose.mongo.GridFSBucket {
  if (!gfsBucket) {
    throw new Error('GridFSBucket is not initialized. Call connectDB() first.');
  }
  return gfsBucket;
}
