import { NextRequest, NextResponse } from 'next/server';
import AuthService, { LoginCredentials, RegisterData } from '../services/Auth';
import { 
  findUserByIdUser, 
  updateUser, 
  getAllUsers 
} from '../services/User';
import { connectToDatabase } from '../configs/database';

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

      const result = await AuthService.login({ username, password });

      return NextResponse.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' 
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

      const result = await AuthService.register({
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
      console.error('Register error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Đăng ký thất bại. Vui lòng thử lại.' 
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

      const result = await AuthService.refreshToken(refreshToken);

      return NextResponse.json({
        success: true,
        message: 'Refresh token thành công',
        data: result,
      });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Refresh token thất bại' 
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
      const decoded = AuthService.verifyAccessToken(token);
      
      const user = await findUserByIdUser(decoded.userId);
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
      console.error('Get profile error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Lấy thông tin profile thất bại' 
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
      const decoded = AuthService.verifyAccessToken(token);
      
      const body = await request.json();
      const { fullName } = body;

      // Chỉ cho phép cập nhật fullName
      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;

      const user = await updateUser(decoded.userId, updateData);
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
      console.error('Update profile error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Cập nhật profile thất bại' 
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
      const decoded = AuthService.verifyAccessToken(token);
      
      // Kiểm tra quyền admin
      if (decoded.role !== 'ADMINQL') {
        return NextResponse.json(
          { error: 'Không có quyền truy cập' },
          { status: 403 }
        );
      }

      const result = await getAllUsers();

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Get users error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Lấy danh sách users thất bại' 
        },
        { status: 400 }
      );
    }
  }
}

export default new UserController();
