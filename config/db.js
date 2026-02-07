import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  // Support both common names for the connection string
  const uri = process.env.MONGO_URI || process.env.MONGO_URL;

  if (!uri) {
    console.error('❌ MongoDB Connection Error: MONGO_URI or MONGO_URL is not defined in environment variables');
    return;
  }

  // Disable buffering so we get immediate errors if not connected
  mongoose.set('bufferCommands', false);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

export default connectDB;
