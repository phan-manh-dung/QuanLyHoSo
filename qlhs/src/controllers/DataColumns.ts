import * as dataService from '../services/DataColumns';
import { Schema } from 'mongoose';
import { deleteRow, updateRow } from '../services/DataColumns';

interface ColumnData {
  id: string;
  label: string;
  type?: Schema.Types.Mixed;
}

interface ApiResponse<T> {
  status: number;
  body: T;
}

interface SuccessResponse {
  [key: string]: any; 
}

interface ErrorResponse {
  message: string;
}

type ResponseBody = SuccessResponse | ErrorResponse;

export async function uploadDataController(req: Request): Promise<{ status: number; body: ResponseBody }> {
  try {
    const data = await req.json();

    if (!Array.isArray(data) || data.length === 0) {
      return { status: 400, body: { message: 'Dữ liệu không hợp lệ' } };
    }

    const inserted = await dataService.insertRows(data);

      return { status: 200, body: inserted };
  } catch (error: any) {
    return { status: 500, body: { message: error.message || 'Lỗi server' } };
  }
}

// get all data
export async function getDataRow(): Promise<ApiResponse<ColumnData[] | ErrorResponse>> {
  try {
    const columns = await dataService.getAllData();
    return { status: 200, body: columns };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return {
      status: 500,
      body: { message: errorMessage },
    };
  }
}

// xóa row
export async function deleteRowController(
  id: string
): Promise<ApiResponse<SuccessResponse | ErrorResponse>> {
  try {
    const deletedRow = await deleteRow(id);
    return {
      status: 200,
      body: {
        message: 'Row deleted successfully',
        deletedRow,
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

// update row
export async function updateRowController(
  id: string,
  req: Request
): Promise<ApiResponse<SuccessResponse | ErrorResponse>> {
  try {
    const { values } = await req.json();
    
    if (!values || typeof values !== 'object') {
      return {
        status: 400,
        body: { message: 'Values object is required' },
      };
    }

    const updatedRow = await updateRow(id, values);
    return {
      status: 200,
      body: {
        message: 'Row updated successfully',
        updatedRow,
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