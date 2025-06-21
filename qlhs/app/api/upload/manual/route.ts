import { NextResponse, NextRequest } from 'next/server';
import { manualDataController } from '../../../../src/controllers/DataColumns';
import { requireAdmin } from '../../../../src/middleware/admin';

export async function POST(req: Request) {
  const adminCheck = requireAdmin(req as unknown as NextRequest);
  if (adminCheck) {
    return adminCheck;
  } else {
    // Xử lý dữ liệu từ request
    const result = await manualDataController(req);
    return NextResponse.json(result.body, { status: result.status });
  }
}
