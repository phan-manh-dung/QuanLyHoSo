import mongoose from "mongoose";

const URL_DATABASE_MONGODB = process.env.URL_DATABASE_MONGODB || "";

if (!URL_DATABASE_MONGODB) {
  throw new Error("Please define the URL_DATABASE_MONGODB environment variable inside .env");
}

export async function connectToDatabase() {
  try {
    await mongoose.connect(URL_DATABASE_MONGODB);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}