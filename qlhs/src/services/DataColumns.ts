import DataColumn from '../models/DataColumn'; // Model lưu dữ liệu dòng
import { connectToDatabase } from '../configs/db';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertRows(data: any[]) {
  await connectToDatabase();

  const rowsToInsert = data.map((item) => {
    const { ...rest } = item;

    return {
      values: new Map(Object.entries(rest)),
    };
  });

  const inserted = await DataColumn.insertMany(rowsToInsert);
  return inserted;
}

// get data for columns
export async function getAllData() {
  const columns = await DataColumn.find();
  return columns;
}