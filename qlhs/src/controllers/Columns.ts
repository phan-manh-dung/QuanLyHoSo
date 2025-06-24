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

interface SuccessResponse {
  message: string;
  deletedColumn: ColumnData;
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

// delete a specific column by ID
export async function deleteColumnController(
  id: string
): Promise<ApiResponse<SuccessResponse | ErrorResponse>> {
  try {
    const deletedColumn = await columnService.deleteColumn(id);
    return {
      status: 200,
      body: {
        message: 'Column deleted successfully',
        deletedColumn,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return {
      status: 500,
      body: { message: errorMessage },
    };
  }
}

// Đổi tên cột (label) theo id
export async function renameColumnController(req: Request): Promise<ApiResponse<ColumnData | ErrorResponse>> {
  try {
    const data = await req.json();
    const { id, newLabel } = data;
    if (!id || !newLabel) {
      return { status: 400, body: { message: 'id and newLabel are required' } };
    }
    const updatedColumn = await columnService.renameColumn(id, newLabel);
    return { status: 200, body: updatedColumn };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return {
      status: 500,
      body: { message: errorMessage },
    };
  }
}
