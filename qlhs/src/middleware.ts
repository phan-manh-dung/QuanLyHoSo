import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Danh sách các route cần bảo vệ
const protectedRoutes = ['/home', '/dashboard', '/admin'];

// Danh sách các route không cần bảo vệ (public)
const publicRoutes = ['/', '/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Kiểm tra xem route hiện tại có cần bảo vệ không
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Kiểm tra xem route hiện tại có phải là public route không
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route
  );

  // Nếu là protected route, kiểm tra authentication
  if (isProtectedRoute) {
    // Kiểm tra token trong cookies hoặc headers
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // Redirect về trang login nếu chưa có token
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Nếu đã đăng nhập và truy cập vào public route, có thể redirect về home
  if (isPublicRoute) {
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (token && pathname === '/') {
      // Nếu đã đăng nhập và đang ở trang login, redirect về home
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 