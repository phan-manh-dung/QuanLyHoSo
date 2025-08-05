import slugify from 'slugify';
import * as columnService from '../services/Columns';

// Define proper types for the response
interface ColumnData {
  id: string;
  label: string;
  type?: string;
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

// Hàm tạo ID unique từ label
async function generateUniqueId(label: string): Promise<string> {
  const baseId = slugify(label, { lower: true, strict: true });
  
  // Kiểm tra xem ID đã tồn tại chưa
  const existingColumns = await columnService.getAllColumns();
  const existingIds = existingColumns.map(col => col.id);
  
  if (!existingIds.includes(baseId)) {
    return baseId;
  }
  
  // Nếu trùng, thêm số vào cuối
  let counter = 1;
  let newId = `${baseId}_${counter}`;
  
  while (existingIds.includes(newId)) {
    counter++;
    newId = `${baseId}_${counter}`;
  }
  
  return newId;
}

export async function createColumn(
  req: Request
): Promise<ApiResponse<ColumnData | ErrorResponse>> {
  try {
    const data = await req.json();

    if (!data.label) {
      return { status: 400, body: { message: 'Label là bắt buộc' } };
    }

    // Kiểm tra label đã tồn tại chưa
    const existingColumns = await columnService.getAllColumns();
    const existingLabel = existingColumns.find(col => 
      col.label.toLowerCase() === data.label.toLowerCase()
    );
    
    if (existingLabel) {
      return { 
        status: 400, 
        body: { message: `Cột "${data.label}" đã tồn tại` } 
      };
    }

    // Tạo ID unique từ label
    const id = await generateUniqueId(data.label);

    // Gọi service với id mới tạo
    const newColumn = await columnService.createColumn({ ...data, id });
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
      return { status: 400, body: { message: 'ID và newLabel là bắt buộc' } };
    }
    
    // Kiểm tra label mới đã tồn tại chưa (trừ column hiện tại)
    const existingColumns = await columnService.getAllColumns();
    const existingLabel = existingColumns.find(col => 
      col.id !== id && col.label.toLowerCase() === newLabel.toLowerCase()
    );
    
    if (existingLabel) {
      return { 
        status: 400, 
        body: { message: `Cột "${newLabel}" đã tồn tại` } 
      };
    }
    
    // Kiểm tra xem có nên đổi ID không
    const currentColumn = existingColumns.find(col => col.id === id);
    if (currentColumn) {
      const newId = slugify(newLabel, { lower: true, strict: true });
      const isIdChanged = newId !== id;
      
      if (isIdChanged) {
        // Có thể thêm logic đổi ID ở đây nếu muốn
        console.log(`⚠️ Warning: Label changed from "${currentColumn.label}" to "${newLabel}", but ID remains "${id}"`);
      }
    }
    
    const updatedColumn = await columnService.updateColumn(id, { label: newLabel });
    return { status: 200, body: updatedColumn };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return {
      status: 500,
      body: { message: errorMessage },
    };
  }
}
