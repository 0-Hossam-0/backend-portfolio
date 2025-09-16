import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION;

let gfsBucket: mongoose.mongo.GridFSBucket | null = null;

export async function connectDB() {
  // 1. Use Mongoose's built-in state to check for connection
  // readyState === 1 means connected. This is more reliable than a custom flag.
  if (mongoose.connection.readyState === 1 && gfsBucket) {
    console.log('Already connected to DB and GridFS is initialized.');
    return;
  }

  console.log('Connecting To Database...');
  try {
    // 2. Connect to the database
    await mongoose.connect(DB_CONNECTION!);

    console.log('Database is connected successfully.');

    // 3. Use the stable mongoose.connection.db object to initialize GridFS
    async () => {
      while (true) {
        if (!mongoose.connection.db) {
          console.log('Waiting for mongoose.connection.db to be available...');
          await new Promise((resolve) => setTimeout(resolve, 100));
          continue;
        }
        gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db!, {
          bucketName: 'uploads',
        });
        console.log('GridFS initialized with bucket name "uploads"');
      }
    };
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
