'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/' }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Kiểm tra các thông tin cần thiết trong localStorage
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        const accessToken = localStorage.getItem('accessToken');

        if (!userId || !username || !accessToken) {
          setIsAuthenticated(false);
          setIsLoading(false);
          toast.error('Vui lòng đăng nhập để truy cập trang này');
          router.push(redirectTo);
          return;
        }

        // Kiểm tra token có hợp lệ không (optional - có thể gọi API verify)
        // Ở đây tôi sẽ chỉ kiểm tra cơ bản, bạn có thể thêm logic verify token
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
        toast.error('Có lỗi xảy ra khi kiểm tra đăng nhập');
        router.push(redirectTo);
      }
    };

    // Chạy ngay lập tức không đợi
    checkAuth();
  }, [router, redirectTo]);

  // Hiển thị loading khi đang kiểm tra
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, không hiển thị nội dung
  if (!isAuthenticated) {
    return null;
  }

  // Nếu đã đăng nhập, hiển thị nội dung
  return <>{children}</>;
} 