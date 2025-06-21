import { NextResponse } from 'next/server';
import { insertRows } from '../../../src/services/DataColumns';
import { getDataRow } from '../../../src/controllers/DataColumns';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await insertRows(data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// GET - Lấy danh sách tất cả data của cột
export async function GET() {
  try {
    const result = await getDataRow();
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}