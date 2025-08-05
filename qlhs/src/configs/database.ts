import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Đảm bảo DATABASE_URL được set
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:123postgres@localhost:5432/QLHS";

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  // Tối ưu connection pooling
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Cache connection status
let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;
  
  try {
    await prisma.$connect();
    isConnected = true;
    console.log('✅ Connected to PostgreSQL database');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  if (isConnected) {
    await prisma.$disconnect();
    isConnected = false;
  }
} 