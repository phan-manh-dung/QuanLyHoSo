import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from './slices/userSlice';

// Cấu hình persist cho từng reducer
const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['user', 'isAuthenticated', 'token'], // Chỉ persist những field này
};

// Root reducer
const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
});

// Cấu hình store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Tạo persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 