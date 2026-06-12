import mongoose from "mongoose";

const connectDB = async () => {
  // In serverless environments the module is reused across requests —
  // skip reconnecting if Mongoose already has an open connection.
  if (mongoose.connection.readyState >= 1) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error("The API will start anyway, but database operations will fail.");
  }
};

export default connectDB;
