import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGO_URL;
  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }
  mongoose.set("strictQuery", false);
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  
  return conn;
  }