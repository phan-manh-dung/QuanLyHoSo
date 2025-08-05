import { prisma } from '../configs/database';
import bcrypt from 'bcryptjs';

export async function createUser(userData: {
  idUser: string;
  username: string;
  password: string;
  fullName?: string;
  role?: 'ADMINQL' | 'USER';
  loginType?: 'GOOGLE' | 'BASIC';
}) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  return await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });
}

export async function findUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: { username },
  });
}

export async function findUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export async function findUserByIdUser(idUser: string) {
  return await prisma.user.findUnique({
    where: { idUser },
  });
}

export async function updateUserLastLogin(id: string) {
  return await prisma.user.update({
    where: { id },
    data: { lastLogin: new Date() },
  });
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function getAllUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      idUser: true,
      username: true,
      fullName: true,
      role: true,
      loginType: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateUser(id: string, data: Partial<{
  username: string;
  fullName: string;
  role: 'ADMINQL' | 'USER';
  password: string;
}>) {
  const updateData: any = { ...data };
  
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }
  
  return await prisma.user.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteUser(id: string) {
  return await prisma.user.delete({
    where: { id },
  });
}
