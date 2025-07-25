import { NextRequest, NextResponse } from 'next/server';
import { deleteColumnController } from '../../../../src/controllers/Columns';
import { requireAdmin } from '../../../../src/middleware/admin';

// Xử lý yêu cầu DELETE để xóa một cột theo ID
export async function DELETE(req: NextRequest) {
  // Kiểm tra quyền admin
  const adminCheck = requireAdmin(req as unknown as NextRequest);
  if (adminCheck) return adminCheck 

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop(); // Lấy id từ URL

  if (!id) {
    return NextResponse.json({ message: 'ID is required' }, { status: 400 });
  }

  try {
    const result = await deleteColumnController(id);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message }, { status: 500 });
  }
}