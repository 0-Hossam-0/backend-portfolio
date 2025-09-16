import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION;

let gfsBucket: mongoose.mongo.GridFSBucket | null = null;
let isConnected = false;

export async function connectDB() {
  if (isConnected && gfsBucket) return;

  console.log('Connecting To Database...');
  try {
    const conn = await mongoose.connect(DB_CONNECTION!, {
      bufferCommands: false,
    });

    // Explicitly wait for the "open" event
    if (conn.connection.readyState !== 1) {
      await new Promise<void>((resolve, reject) => {
        conn.connection.once('open', () => resolve());
        conn.connection.once('error', (err) => reject(err));
      });
    }

    isConnected = true;
    console.log('Database is connected successfully.');

    const db = conn.connection.db;
    if (!db) throw new Error('DB is still undefined after open');

    gfsBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads',
    });
    console.log('GridFS initialized with bucket name "uploads"');
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
