import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
  
const DB_CONNECTION = process.env.DB_CONNECTION;
export function connectDB() {
  console.log('Connecting To Database...');
  mongoose
    .connect(DB_CONNECTION!)
    .then(() => {
      console.log('Database is connected successfully.');
    })
    .catch((error) => {
      console.log(error);
    });
}