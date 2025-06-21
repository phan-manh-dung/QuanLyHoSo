import { jwtDecode } from 'jwt-decode';

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Decode JWT token và trả về payload
 * @param token - JWT token string
 * @returns Decoded payload hoặc null nếu invalid
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
      const decoded = jwtDecode<JWTPayload>(token);
    return decoded;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};

/**
 * Kiểm tra JWT token có hợp lệ không
 * @param token - JWT token string
 * @returns true nếu token hợp lệ và chưa hết hạn
 */
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded) return false;

    // Kiểm tra token có hết hạn chưa
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

/**
 * Lấy thông tin user từ JWT token
 * @param token - JWT token string
 * @returns User info hoặc null nếu token invalid
 */
export const getUserFromToken = (token: string) => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  return {
    userId: decoded.userId,
    username: decoded.username,
    role: decoded.role,
  };
};

/**
 * Kiểm tra user có phải admin không
 * @param token - JWT token string
 * @returns true nếu user là admin
 */
export const isAdmin = (token: string): boolean => {
  const user = getUserFromToken(token);
  return user?.role === 'adminql' && user?.username === 'admin';
};

/**
 * Lấy thời gian hết hạn của token
 * @param token - JWT token string
 * @returns Thời gian hết hạn (Date object) hoặc null
 */
export const getTokenExpiration = (token: string): Date | null => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  return new Date(decoded.exp * 1000);
};

/**
 * Kiểm tra token sắp hết hạn (trong vòng 5 phút)
 * @param token - JWT token string
 * @returns true nếu token sắp hết hạn
 */
export const isTokenExpiringSoon = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;

  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  return expiration <= fiveMinutesFromNow;
}; 