import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Sử dụng thay vì useDispatch thông thường
export const useAppDispatch = () => useDispatch<AppDispatch>();
 
// Sử dụng thay vì useSelector thông thường
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 