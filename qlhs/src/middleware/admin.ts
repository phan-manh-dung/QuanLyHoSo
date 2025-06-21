import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { ROLES } from '../utils/roles';

export function requireAdmin(request: NextRequest) {
  // Lấy token từ header hoặc cookie
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('accessToken')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Access token required' }, { status: 401 });
  }

  try {
    const decoded: any = jwtDecode(token);
    if (decoded.role !== ROLES.ADMIN) {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }
    // Nếu là admin, cho phép tiếp tục
    return null;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
} 