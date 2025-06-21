import mongoose from "mongoose";

const URL_DATABASE_MONGODB_TEST = process.env.URL_DATABASE_MONGODB_TEST || "";

if (!URL_DATABASE_MONGODB_TEST) {
  throw new Error("Please define the URL_DATABASE_MONGODB_TEST environment variable inside .env");
}

export async function connectToDatabase() {
  try {
    await mongoose.connect(URL_DATABASE_MONGODB_TEST);
    console.log("👉 MONGO_URI:", URL_DATABASE_MONGODB_TEST);

  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}