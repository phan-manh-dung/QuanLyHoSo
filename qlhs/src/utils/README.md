# Utils Folder

Thư mục chứa các utility functions có thể tái sử dụng trong toàn bộ ứng dụng.

## Cấu trúc

```
src/utils/
├── index.ts          # Main export file
├── dateUtils.ts      # Date formatting utilities
└── README.md         # This file
```

## Cách sử dụng

### Import từ index file (Khuyến nghị)

```typescript
import { formatDateToDDMMYYYY, isValidDate } from '../../src/utils';
```

### Import trực tiếp từ file cụ thể

```typescript
import { formatDateToDDMMYYYY } from '../../src/utils/dateUtils';
```

## Date Utilities (`dateUtils.ts`)

### `formatDateToDDMMYYYY(date)`

Format date thành định dạng `dd/mm/yyyy`

**Parameters:**

- `date`: Date | string | number | null

**Returns:**

- `string | null`: Date string hoặc null nếu invalid

**Supported formats:**

- Date object: `new Date('2024-12-31')`
- Excel serial: `45678`
- String dates: `'31/12/2024'`, `'31/12/24'`, `'2024-12-31'`

**Example:**

```typescript
formatDateToDDMMYYYY('31/12/24'); // Returns: '31/12/2024'
formatDateToDDMMYYYY(45678); // Returns: '31/12/2024'
formatDateToDDMMYYYY(new Date()); // Returns: '31/12/2024'
```

### `excelSerialToDate(serial)`

Convert Excel serial number thành Date object

**Parameters:**

- `serial`: number - Excel serial number

**Returns:**

- `Date`: Date object

### `isValidDate(value)`

Kiểm tra xem value có phải là date hợp lệ không

**Parameters:**

- `value`: any

**Returns:**

- `boolean`: true nếu là date hợp lệ

### `getCurrentDate()`

Lấy ngày hiện tại theo định dạng `dd/mm/yyyy`

**Returns:**

- `string`: Current date string

## Thêm Utility Functions mới

1. Tạo file mới trong `src/utils/` (ví dụ: `stringUtils.ts`)
2. Export functions từ file đó
3. Thêm export vào `index.ts`
4. Cập nhật README này

**Example:**

```typescript
// stringUtils.ts
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// index.ts
export * from './stringUtils';
```

## Best Practices

1. **Sử dụng index file**: Import từ `../../src/utils` thay vì file cụ thể
2. **TypeScript**: Luôn định nghĩa types cho parameters và return values
3. **Documentation**: Thêm JSDoc comments cho tất cả functions
4. **Testing**: Viết unit tests cho utility functions
5. **Naming**: Đặt tên function rõ ràng, descriptive
