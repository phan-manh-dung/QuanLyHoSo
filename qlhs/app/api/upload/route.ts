import { NextResponse } from 'next/server';
import { insertRows } from '../../../src/services/DataColumns';

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
