import * as dataService from '../services/DataColumns';
import { Schema } from 'mongoose';

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