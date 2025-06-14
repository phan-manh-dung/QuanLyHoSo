import { NextResponse } from 'next/server';
import { deleteRowController } from '../../../../src/controllers/DataColumns';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteRowController(id);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
} 