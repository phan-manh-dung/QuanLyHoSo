import DataColumn from '../models/DataColumn'; // Model lưu dữ liệu dòng
import { connectToDatabase } from '../configs/db';


export async function insertRows(data: any[]) {
  await connectToDatabase();

  // Lấy tất cả dữ liệu đã có trong DB
  const allRows = await DataColumn.find();

  // Chuẩn hóa dữ liệu DB thành mảng object thuần
  const dbRows = allRows.map(row => {
    const obj: Record<string, any> = {};
    for (const [k, v] of row.values.entries()) {
      obj[k] = v;
    }
    return obj;
  });

  // Tìm các dòng upload bị trùng hoàn toàn với DB
  const duplicateRows: number[] = [];
  data.forEach((item, idx) => {
    const isDuplicate = dbRows.some(dbRow => {
      // So sánh số trường
      const keys1 = Object.keys(dbRow);
      const keys2 = Object.keys(item);
      if (keys1.length !== keys2.length) return false;
      // So sánh từng trường
      return keys1.every(k => dbRow[k] === item[k]);
    });
    if (isDuplicate) duplicateRows.push(idx + 1); // index bắt đầu từ 1 cho user dễ hiểu
  });

  if (duplicateRows.length > 0) {
    return {
      success: false,
      duplicateRows,
      message: `Dữ liệu tải lên bị trùng ở dòng số:[ ${duplicateRows.join(', ')} ] của file excel`,
    };
  }

  // Nếu không trùng thì lưu dữ liệu
  const rowsToInsert = data.map((item) => ({
    values: new Map(Object.entries(item)),
  }));

  const inserted = await DataColumn.insertMany(rowsToInsert);
  return { success: true, inserted };
}

// get data for columns
export async function getAllData() {
  const columns = await DataColumn.find();
  return columns;
}