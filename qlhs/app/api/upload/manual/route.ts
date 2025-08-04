import { NextResponse, NextRequest } from 'next/server';
import { manualDataController } from '../../../../src/controllers/DataColumns';
import { requireAdmin } from '../../../../src/middleware/admin';
import { connectToDatabase } from '../../../../src/configs/db';

export async function POST(req: Request) {
  await connectToDatabase();
  const adminCheck = requireAdmin(req as unknown as NextRequest);
  if (adminCheck) {
    return adminCheck;
  } else {
    // Xử lý dữ liệu từ request
    const result = await manualDataController(req);
    return NextResponse.json(result.body, { status: result.status });
  }
}
