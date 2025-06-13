import Column, { IColumn } from '../models/Columns';

// Add a new column to the database
export async function addColumn(data: { id: string; label: string; type?: string }): Promise<IColumn> {
  const { id, label, type = 'string' } = data;

  // Kiểm tra cột có tồn tại chưa (unique id)
  const exist = await Column.findOne({ id });
  if (exist) throw new Error('Column ID already exists');

  const newColumn = new Column({ id, label, type });
  await newColumn.save();

  return newColumn;
}

// get all columns
export async function getAllColumns() {
  const columns = await Column.find();
  return columns;
}