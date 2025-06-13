import slugify from 'slugify';
import * as columnService from '../services/Columns';
import { Schema } from 'mongoose';

// Define proper types for the response
interface ColumnData {
  id: string;
  label: string;
  type?: Schema.Types.Mixed;
}

interface ApiResponse<T> {
  status: number;
  body: T;
}

interface ErrorResponse {
  message: string;
}

export async function createColumn(
  req: Request
): Promise<ApiResponse<ColumnData | ErrorResponse>> {
  try {
    const data = await req.json(); // đọc body json

    if (!data.label) {
      return { status: 400, body: { message: 'id and label are required' } };
    }

    // Tạo id từ label (chuyển sang dạng slug)
    const id = slugify(data.label, { lower: true, strict: true });

    // Gọi service với id mới tạo
    const newColumn = await columnService.addColumn({ ...data, id });
    return { status: 201, body: newColumn };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return {
      status: 500,
      body: { message: errorMessage },
    };
  }
}

// get all columns
export async function getColumns(): Promise<ApiResponse<ColumnData[] | ErrorResponse>> {
  try {
    const columns = await columnService.getAllColumns();
    return { status: 200, body: columns };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return {
      status: 500,
      body: { message: errorMessage },
    };
  }
}
