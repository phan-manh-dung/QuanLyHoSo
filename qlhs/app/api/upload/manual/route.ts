import { NextResponse } from 'next/server';
import { manualDataController } from '../../../../src/controllers/DataColumns';

export async function POST(req: Request) {
  const result = await manualDataController(req);
  return NextResponse.json(result.body, { status: result.status });
} 