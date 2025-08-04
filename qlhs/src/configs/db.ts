import mongoose from "mongoose";

const URL_DATABASE_MONGODB_TEST = process.env.URL_DATABASE_MONGODB_TEST || "";

if (!URL_DATABASE_MONGODB_TEST) {
  throw new Error("Please define the URL_DATABASE_MONGODB_TEST environment variable inside .env");
}

// Biến cache toàn cục (global) để giữ connection giữa các lần gọi
const cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) {
    // Nếu đã có connection, trả về luôn
    return cached.conn;
  }
  if (!cached.promise) {
    // Nếu chưa có promise, tạo mới
    cached.promise = mongoose.connect(URL_DATABASE_MONGODB_TEST, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  (global as any).mongoose = cached; // Lưu vào global để các lần sau dùng lại
  return cached.conn;
}