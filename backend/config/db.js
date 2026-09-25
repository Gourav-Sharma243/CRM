import mongoose from "mongoose";

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGO_URI || process.env.MONGO_URL;
  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  mongoose.set("strictQuery", false);
  cachedPromise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 10000,
    })
    .then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    })
    .catch((err) => {
      cachedPromise = null;
      throw err;
    });

  return cachedPromise;
};