# JWT Authentication System

## Tổng quan

Hệ thống authentication đã được cải tiến để sử dụng JWT (JSON Web Tokens) thay vì lưu trực tiếp thông tin user trong localStorage.

## Cấu trúc

```
src/
├── contexts/
│   └── AuthContext.tsx      # React Context cho authentication
├── utils/
│   ├── jwtUtils.ts          # JWT utility functions
│   └── index.ts             # Export tất cả utilities
└── components/
    └── AuthGuard.tsx        # Protected route component
```

## Cách hoạt động

### 1. Login Process

```typescript
// 1. User submit login form
// 2. Server trả về accessToken và refreshToken
// 3. AuthContext.login() được gọi
// 4. Tokens được lưu vào localStorage
// 5. JWT được decode để lấy user info
// 6. User info được lưu vào state
```

### 2. Authentication Check

```typescript
// 1. AuthContext tự động check token khi mount
// 2. Decode JWT để lấy user info
// 3. Validate token expiration
// 4. Set authentication state
```

### 3. Protected Routes

```typescript
// AuthGuard component check authentication
// Redirect to login nếu chưa đăng nhập
// Hiển thị content nếu đã đăng nhập
```

## Components

### AuthContext

**File:** `src/contexts/AuthContext.tsx`

**Features:**

- Quản lý authentication state
- Auto-decode JWT tokens
- Provide login/logout functions
- Check admin permissions

**Usage:**

```typescript
import { useAuth } from '../src/contexts/AuthContext';

const { user, isAuthenticated, isAdminUser, login, logout } = useAuth();
```

### AuthGuard

**File:** `src/components/AuthGuard.tsx`

**Features:**

- Protect routes from unauthorized access
- Auto-redirect to login page
- Loading state while checking auth

**Usage:**

```typescript
import AuthGuard from '../src/components/AuthGuard';

<AuthGuard>
  <ProtectedComponent />
</AuthGuard>
```

## JWT Utilities

### decodeJWT(token)

Decode JWT token và trả về payload

### isTokenValid(token)

Kiểm tra token có hợp lệ và chưa hết hạn

### getUserFromToken(token)

Lấy thông tin user từ JWT token

### isAdmin(token)

Kiểm tra user có phải admin không

### getTokenExpiration(token)

Lấy thời gian hết hạn của token

### isTokenExpiringSoon(token)

Kiểm tra token sắp hết hạn (trong 5 phút)

## Security Features

### 1. Token Validation

- Check token expiration
- Validate token format
- Auto-clear invalid tokens

### 2. Admin Check

- Server-side validation (recommended)
- Client-side check for UI (convenience)
- Role-based access control

### 3. Secure Storage

- Access token: localStorage (for convenience)
- Refresh token: localStorage (for auto-refresh)
- User info: Decoded from JWT (not stored)

## Usage Examples

### Login

```typescript
const { login } = useAuth();

const handleLogin = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (data.success) {
    login(data.data.accessToken, data.data.refreshToken);
  }
};
```

### Check Admin

```typescript
const { isAdminUser } = useAuth();

// Hiển thị admin features
{isAdminUser && <AdminPanel />}
```

### Logout

```typescript
const { logout } = useAuth();

const handleLogout = () => {
  logout();
  router.push('/');
};
```

### Protected Route

```typescript
import AuthGuard from '../src/components/AuthGuard';

export default function HomePage() {
  return (
    <AuthGuard>
      <div>Protected Content</div>
    </AuthGuard>
  );
}
```

## Migration from localStorage

### Before (Insecure)

```typescript
// Lưu trực tiếp user info
localStorage.setItem('userId', user.id);
localStorage.setItem('username', user.username);
localStorage.setItem('role', user.role);

// Check admin
const isAdmin = localStorage.getItem('role') === 'adminql';
```

### After (Secure)

```typescript
// Chỉ lưu tokens
localStorage.setItem('accessToken', token);

// Decode JWT để lấy user info
const { user, isAdminUser } = useAuth();

// Check admin
const isAdmin = isAdminUser;
```

## Best Practices

1. **Server-side validation**: Luôn validate permissions ở API endpoints
2. **Token refresh**: Implement automatic token refresh
3. **Error handling**: Handle token expiration gracefully
4. **Security headers**: Use proper security headers
5. **HTTPS only**: Deploy with HTTPS in production

## Future Improvements

1. **HttpOnly cookies**: Store refresh tokens in HttpOnly cookies
2. **Token rotation**: Implement token rotation for better security
3. **Rate limiting**: Add rate limiting for auth endpoints
4. **Audit logging**: Log authentication events
5. **Multi-factor auth**: Add 2FA support
