'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/' }: AuthGuardProps) {
  const { isAuthenticated, user, isAuthLoading } = useAuth();
  const router = useRouter();

  // Hiển thị loading khi đang kiểm tra
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, redirect về login
  if (!isAuthenticated || !user) {
    if (typeof window !== 'undefined') {
      toast.error('Vui lòng đăng nhập để truy cập trang này');
      router.push(redirectTo);
    }
    return null;
  }

  // Nếu đã đăng nhập, hiển thị nội dung
  return <>{children}</>;
} 