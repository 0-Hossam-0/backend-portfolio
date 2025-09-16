import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION;

let gfsBucket: mongoose.mongo.GridFSBucket | null = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1 && gfsBucket) {
    console.log('Already connected to DB and GridFS is initialized.');
    return;
  }

  console.log('Connecting To Database...');
  try {
    await mongoose.connect(DB_CONNECTION!);
    console.log('Database is connected successfully.');

    // IIFE — invoked immediately
    await (async () => {
      // poll a bounded number of times (don't loop forever)
      const maxAttempts = 50;
      let attempt = 0;
      while (!mongoose.connection.db && attempt++ < maxAttempts) {
        console.log('Waiting for mongoose.connection.db to be available...');
        await new Promise((r) => setTimeout(r, 100));
      }

      if (!mongoose.connection.db) {
        throw new Error('Timed out waiting for mongoose.connection.db');
      }

      if (!gfsBucket) {
        gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
          bucketName: 'uploads',
        });
        console.log('GridFS initialized with bucket name "uploads"');
      }
    })();
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
