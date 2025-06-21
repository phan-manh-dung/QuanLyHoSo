# Test Cases cho Xử lý Ngày tháng

## Các trường hợp cần test:

### 1. Excel Date Format (Custom)

- Input: `03/12/2024` (Custom format)
- Expected: `03/12/2024`

### 2. Excel Date Format (Date)

- Input: `12/31/2024` (Date format)
- Expected: `31/12/2024`

### 3. Excel Serial Number

- Input: `45678` (Excel serial)
- Expected: `31/12/2024`

### 4. String Date Formats

- Input: `31/12/24` (2-digit year)
- Expected: `31/12/2024`

- Input: `31-12-2024` (dash separator)
- Expected: `31/12/2024`

- Input: `2024-12-31` (ISO format)
- Expected: `31/12/2024`

### 5. Date Object

- Input: `new Date('2024-12-31')`
- Expected: `31/12/2024`

## Cách test:

1. Mở Developer Tools (F12)
2. Vào tab Console
3. Upload file Excel có các định dạng ngày tháng khác nhau
4. Xem log debug để kiểm tra xử lý

## Debug Log Format:

```javascript
Processing column_name: {
  originalValue: "input_value",
  type: "string|number|object",
  isDate: true/false,
  isNumber: true/false,
  isString: true/false,
  formatted: "dd/mm/yyyy"
}
```

## Lưu ý:

- Tất cả ngày tháng sẽ được chuẩn hóa về định dạng `dd/mm/yyyy`
- Năm 2 chữ số sẽ được tự động thêm `20` vào đầu
- Excel serial numbers sẽ được convert đúng
- Các định dạng không phải ngày tháng sẽ giữ nguyên
