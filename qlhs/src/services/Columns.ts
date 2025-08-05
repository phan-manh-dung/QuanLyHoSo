import { prisma } from '../configs/database';

export async function createColumn(data: { id: string; label: string; type?: string }) {
  return await prisma.column.create({
    data: {
      id: data.id,
      label: data.label,
      type: data.type || 'string',
    },
  });
}

export async function getAllColumns() {
  return await prisma.column.findMany({
    orderBy: { id: 'asc' },
  });
}

export async function getColumnById(id: string) {
  return await prisma.column.findUnique({
    where: { id },
  });
}

export async function updateColumn(id: string, data: { label?: string; type?: string }) {
  return await prisma.column.update({
    where: { id },
    data,
  });
}

export async function deleteColumn(id: string) {
  return await prisma.column.delete({
    where: { id },
  });
}

export async function deleteAllColumns() {
  return await prisma.column.deleteMany();
}