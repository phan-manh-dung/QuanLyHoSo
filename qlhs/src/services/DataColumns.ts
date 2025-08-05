import { prisma } from '../configs/database';

export async function insertRows(data: any[]) {
  // Sử dụng transaction để tăng tốc
  return await prisma.$transaction(async (tx) => {
    const allRows = await tx.dataColumn.findMany({
      select: { values: true }
    });

    // Chuẩn hóa dữ liệu DB thành mảng object thuần
    const dbRows = allRows.map(row => row.values as Record<string, any>);

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
      if (isDuplicate) duplicateRows.push(idx + 1);
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
      values: item,
    }));

    const inserted = await tx.dataColumn.createMany({
      data: rowsToInsert,
    });

    return { success: true, inserted };
  });
}

// get data for columns
export async function getAllData() {
  return await prisma.dataColumn.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000, // Giới hạn để tránh load quá nhiều
  });
}

// delete a specific row by ID
export async function deleteRow(id: string) {
  const deletedRow = await prisma.dataColumn.delete({
    where: { id },
  });
  
  if (!deletedRow) {
    throw new Error('Row not found');
  }
  
  return deletedRow;
}

// update a specific row by ID
export async function updateRow(id: string, values: Record<string, any>) {
  const updatedRow = await prisma.dataColumn.update({
    where: { id },
    data: { values },
  });
  
  if (!updatedRow) {
    throw new Error('Row not found');
  }
  
  return updatedRow;
}

export async function insertRow(data: Record<string, any>) {
  const inserted = await prisma.dataColumn.create({
    data: { values: data },
  });
  return inserted;
}

// get data row for API
export async function getDataRow() {
  try {
    const data = await getAllData();
    return {
      status: 200,
      body: data,
    };
  } catch {
    return {
      status: 500,
      body: { message: 'Failed to fetch data' },
    };
  }
}