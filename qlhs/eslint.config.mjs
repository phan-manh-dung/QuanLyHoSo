import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// const eslintConfig = [
//   ...compat.extends("next/core-web-vitals", "next/typescript"),
// ];

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Tắt cảnh báo khi dùng any
      '@typescript-eslint/no-explicit-any': 'off',
      // Điều chỉnh quy tắc no-unused-vars (thay "warn" bằng "off" để tắt hoàn toàn)
      'no-unused-vars': 'off', // Hoặc giữ "warn" nếu chỉ muốn gạch vàng
    },
  },
];

export default eslintConfig;
