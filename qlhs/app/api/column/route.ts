import { createColumn,getColumns  } from '../../../src/controllers/Columns';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../src/configs/db';

// POST - Tạo cột mới
export async function POST(req: Request) {
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