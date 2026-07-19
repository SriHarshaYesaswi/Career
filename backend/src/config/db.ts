import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || process.env.mongodb_url || process.env.MONGODB_URL;
    
    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI is missing in environment variables.');
      process.exit(1);
    }

    const conn = await mongoose.connect(MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
