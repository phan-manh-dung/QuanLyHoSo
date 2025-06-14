import { NextRequest, NextResponse } from 'next/server';
import UserService, { LoginCredentials, RegisterData } from '../services/User';
import { connectToDatabase } from '../configs/db';

class UserController {
  // Đăng nhập
  async login(request: NextRequest) {
    try {
      await connectToDatabase();
      
      const body = await request.json();
      const { username, password }: LoginCredentials = body;

      // Validate input
      if (!username || !password) {
        return NextResponse.json(
          { error: 'Username và password là bắt buộc' },
          { status: 400 }
        );
      }

      const result = await UserService.login({ username, password });

      return NextResponse.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Đăng nhập thất bại' 
        },
        { status: 400 }
      );
    }
  }

  // Đăng ký
  async register(request: NextRequest) {
    try {
      await connectToDatabase();
      
      const body = await request.json();
      const { username, password, role }: RegisterData = body;

      // Validate input
      if (!username || !password) {
        return NextResponse.json(
          { error: 'Username và password là bắt buộc' },
          { status: 400 }
        );
      }

      // Validate password length
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password phải có ít nhất 6 ký tự' },
          { status: 400 }
        );
      }

      const result = await UserService.register({
        username,
        password,
        role,
      });

      return NextResponse.json({
        success: true,
        message: 'Đăng ký thành công',
        data: result,
      });
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Đăng ký thất bại' 
        },
        { status: 400 }
      );
    }
  }

  // Refresh token
  async refreshToken(request: NextRequest) {
    try {
      await connectToDatabase();
      
      const body = await request.json();
      const { refreshToken } = body;

      if (!refreshToken) {
        return NextResponse.json(
          { error: 'Refresh token là bắt buộc' },
          { status: 400 }
        );
      }

      const result = await UserService.refreshToken(refreshToken);

      return NextResponse.json({
        success: true,
        message: 'Refresh token thành công',
        data: result,
      });
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Refresh token thất bại' 
        },
        { status: 400 }
      );
    }
  }

  // Lấy thông tin user profile
  async getProfile(request: NextRequest) {
    try {
      await connectToDatabase();
      
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Access token là bắt buộc' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const decoded = UserService.verifyAccessToken(token);
      
      const user = await UserService.getUserById(decoded.userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User không tồn tại' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: user.idUser,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Lấy thông tin profile thất bại' 
        },
        { status: 401 }
      );
    }
  }

  // Cập nhật thông tin user
  async updateProfile(request: NextRequest) {
    try {
      await connectToDatabase();
      
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Access token là bắt buộc' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const decoded = UserService.verifyAccessToken(token);
      
      const body = await request.json();
      const { fullName } = body;

      // Chỉ cho phép cập nhật fullName
      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;

      const user = await UserService.updateUser(decoded.userId, updateData);
      if (!user) {
        return NextResponse.json(
          { error: 'User không tồn tại' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Cập nhật profile thành công',
        data: {
          id: user.idUser,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Cập nhật profile thất bại' 
        },
        { status: 400 }
      );
    }
  }

  // Lấy danh sách users (chỉ admin)
  async getUsers(request: NextRequest) {
    try {
      await connectToDatabase();
      
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Access token là bắt buộc' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const decoded = UserService.verifyAccessToken(token);
      
      // Kiểm tra quyền admin
      if (decoded.role !== 'admin') {
        return NextResponse.json(
          { error: 'Không có quyền truy cập' },
          { status: 403 }
        );
      }

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');

      const result = await UserService.getUsers(page, limit);

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Lấy danh sách users thất bại' 
        },
        { status: 400 }
      );
    }
  }
}

export default new UserController();
