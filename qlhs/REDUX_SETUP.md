# Hướng dẫn sử dụng Redux trong dự án Next.js

## Cấu trúc Redux đã được tích hợp

### 1. Store Configuration

- **File**: `src/store/index.ts`
- **Chức năng**: Cấu hình Redux store với Redux Toolkit và Redux Persist
- **Features**:
  - Redux Toolkit để quản lý state
  - Redux Persist để lưu trữ state vào localStorage
  - TypeScript support

### 2. User Slice

- **File**: `src/store/slices/userSlice.ts`
- **Chức năng**: Quản lý state cho user authentication
- **Actions**:
  - `loginUser`: Đăng nhập
  - `registerUser`: Đăng ký
  - `logoutUser`: Đăng xuất
  - `fetchUserProfile`: Lấy thông tin profile
  - `refreshToken`: Làm mới access token

### 3. Custom Hooks

- **File**: `src/store/hooks.ts`
- **Chức năng**: Type-safe hooks cho Redux
- **Hooks**:
  - `useAppDispatch`: Dispatch actions với TypeScript
  - `useAppSelector`: Select state với TypeScript

### 4. Redux Provider

- **File**: `src/store/Provider.tsx`
- **Chức năng**: Wrap ứng dụng với Redux Provider và PersistGate

## API Endpoints

### Authentication APIs

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/refresh` - Làm mới token

### User APIs

- `GET /api/user/profile` - Lấy thông tin profile
- `PUT /api/user/profile` - Cập nhật profile
- `GET /api/user` - Lấy danh sách users (admin only)

## Cách sử dụng

### 1. Trong Component

```tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, logoutUser } from '../store/slices/userSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector(
    (state) => state.user
  );

  const handleLogin = async () => {
    const result = await dispatch(
      loginUser({
        username: 'test',
        password: 'password',
      })
    );

    if (loginUser.fulfilled.match(result)) {
      console.log('Login successful');
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.fullName}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 2. Access Token Management

Redux tự động quản lý access token và refresh token:

- Access token có thời hạn 3 giờ
- Refresh token có thời hạn 1 tuần
- Token được lưu trong localStorage thông qua Redux Persist

### 3. Error Handling

```tsx
const { error } = useAppSelector((state) => state.user);

useEffect(() => {
  if (error) {
    toast.error(error);
  }
}, [error]);
```

## Environment Variables

Thêm các biến môi trường vào file `.env.local`:

```env
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
URL_DATABASE_MONGODB=your-mongodb-connection-string
```

## Database Schema

### User Model

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Hashed with bcrypt
  fullName: string;
  role: 'admin' | 'user' | 'moderator';
  loginType: 'google' | 'basic';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Features

1. **Password Hashing**: Sử dụng bcrypt với salt rounds = 10
2. **JWT Tokens**: Access token (3h) và Refresh token (7d)
3. **Input Validation**: Validate email, password length, required fields
4. **Role-based Access**: Kiểm tra quyền admin cho một số API
5. **Token Verification**: Middleware để verify JWT tokens

## Demo Component

File `src/components/LoginForm.tsx` là một component demo hoàn chỉnh cho:

- Đăng nhập/Đăng ký
- Hiển thị thông tin user
- Đăng xuất
- Error handling
- Loading states

## Lưu ý

1. Đảm bảo MongoDB đã được cấu hình và chạy
2. Cài đặt các dependencies cần thiết:
   ```bash
   npm install @reduxjs/toolkit react-redux redux-persist bcryptjs jsonwebtoken
   ```
3. Redux state được persist vào localStorage, nên user sẽ không bị logout khi refresh trang
4. Access token sẽ tự động được refresh khi hết hạn (cần implement interceptor)
