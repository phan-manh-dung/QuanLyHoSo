import { createColumn,getColumns  } from '../../../src/controllers/Columns';
import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '../../../src/configs/db';
import { requireAdmin } from '../../../src/middleware/admin';

// POST - Tạo cột mới (chỉ admin)
export async function POST(req: Request) {
  // Kiểm tra quyền admin
  const adminCheck = requireAdmin(req as unknown as NextRequest);
  if (adminCheck) return adminCheck;

  await connectToDatabase();
  const { status, body } = await createColumn(req);
  return NextResponse.json(body, { status });
}

// GET - Lấy danh sách tất cả các cột
export async function GET() {
  await connectToDatabase();
  const { status, body } = await getColumns();
  return NextResponse.json(body, { status });
}