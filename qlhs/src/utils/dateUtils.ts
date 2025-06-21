
export const formatDateToDDMMYYYY = (
  date: Date | string | number | null
): string | null => {
  if (!date) return null;
  let d: Date;

  if (date instanceof Date) {
    d = date;
  } else if (typeof date === 'number') {
    // Xử lý Excel serial number
    if (date > 1 && date < 100000) {
      // Excel serial date (số ngày từ 1/1/1900)
      const utc_days = Math.floor(date - 25569);
      const utc_value = utc_days * 86400;
      d = new Date(utc_value * 1000);
    } else {
      // Có thể là timestamp
      d = new Date(date);
    }
  } else if (typeof date === 'string') {
    // Xử lý string date
    const trimmedDate = date.trim();
    
    // Kiểm tra nếu đã là định dạng dd/mm/yyyy
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmedDate)) {
      return trimmedDate; // Trả về nguyên bản nếu đã đúng định dạng
    }
    
    // Kiểm tra nếu là định dạng dd/mm/yy
    if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(trimmedDate)) {
      const parts = trimmedDate.split('/');
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
      return `${day}/${month}/${year}`;
    }
    
    // Thử parse với Date constructor
    d = new Date(trimmedDate);
  } else {
    return null;
  }

  // Kiểm tra nếu date hợp lệ
  if (isNaN(d.getTime())) {
    return String(date); // Trả về nguyên bản nếu không parse được
  }

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Convert Excel serial number to Date object
 * 
 * @param serial - Excel serial number
 * @returns Date object
 */
export const excelSerialToDate = (serial: number): Date => {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000);
};

/**
 * Check if a value is a valid date
 * 
 * @param value - Value to check
 * @returns true if valid date, false otherwise
 */
export const isValidDate = (value: any): boolean => {
  if (!value) return false;
  
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  
  if (typeof value === 'number') {
    return value > 1 && value < 100000;
  }
  
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(trimmed) ||
           /^\d{1,2}-\d{1,2}-\d{2,4}$/.test(trimmed) ||
           /^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed) ||
           /^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(trimmed);
  }
  
  return false;
};

export const getCurrentDate = (): string => {
  const now = new Date();
  return formatDateToDDMMYYYY(now) || '';
}; 