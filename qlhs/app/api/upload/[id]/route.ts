import { NextRequest, NextResponse } from 'next/server';
import {
  deleteRowController,
  updateRowController,
} from '../../../../src/controllers/DataColumns';
import { requireAdmin } from '../../../../src/middleware/admin';

// Xử lý DELETE cho việc xóa dữ liệu của cột
export async function DELETE(req: NextRequest) {
  const adminCheck = requireAdmin(req as unknown as NextRequest);
  if (adminCheck) {
    return adminCheck;
  } else {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    try {
      const result = await deleteRowController(id);
      return NextResponse.json(result.body, { status: result.status });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ message }, { status: 500 });
    }
  }
}

// Xử lý PUT cho việc cập nhật dữ liệu của cột
export async function PUT(req: NextRequest) {
  const adminCheck = requireAdmin(req as unknown as NextRequest);
  if (adminCheck) {
    return adminCheck;
  } else {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    try {
      const result = await updateRowController(id, req);
      return NextResponse.json(result.body, { status: result.status });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ message }, { status: 500 });
    }
  }
}
