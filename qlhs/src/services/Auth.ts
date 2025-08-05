import jwt from 'jsonwebtoken';
import { 
  findUserByUsername, 
  findUserByIdUser, 
  comparePassword, 
  createUser, 
  updateUserLastLogin 
} from './User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  role?: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  // Tạo access token (3 giờ)
  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '3h' });
  }

  // Tạo refresh token (1 tuần)
  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  // Đăng nhập
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { username, password } = credentials;

    // Tìm user theo username
    const user = await findUserByUsername(username);
    if (!user) {
      throw new Error('Username hoặc password không đúng');
    }

    // Kiểm tra password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Username hoặc password không đúng');
    }

    // Cập nhật lastLogin
    await updateUserLastLogin(user.id);

    // Tạo tokens
    const tokenPayload: TokenPayload = {
      userId: user.idUser,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.idUser,
        username: user.username,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  // Đăng ký
  async register(userData: RegisterData): Promise<AuthResponse> {
    const { username, password, role = 'USER' } = userData;

    // Kiểm tra username đã tồn tại
    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      throw new Error('Username đã tồn tại');
    }

    // Tạo user mới
    const newUser = await createUser({
      idUser: this.generateUserId(),
      username,
      password,
      role: role as 'ADMINQL' | 'USER',
      loginType: 'BASIC',
    });

    // Tạo tokens
    const tokenPayload: TokenPayload = {
      userId: newUser.idUser,
      username: newUser.username,
      role: newUser.role,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    return {
      user: {
        id: newUser.idUser,
        username: newUser.username,
        role: newUser.role,
      },
      accessToken,
      refreshToken,
    };
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_SECRET
      ) as TokenPayload;

      // Kiểm tra user có tồn tại không
      const user = await findUserByIdUser(decoded.userId);
      if (!user) {
        throw new Error('User không tồn tại');
      }

      // Tạo access token mới
      const newTokenPayload: TokenPayload = {
        userId: user.idUser,
        username: user.username,
        role: user.role,
      };

      const newAccessToken = this.generateAccessToken(newTokenPayload);

      return { accessToken: newAccessToken };
    } catch {
      throw new Error('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  // Tạo ID ngẫu nhiên cho user
  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Verify access token
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      throw new Error('Access token không hợp lệ');
    }
  }
}

export default new AuthService(); 