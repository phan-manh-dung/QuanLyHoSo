import { NextRequest, NextResponse } from 'next/server';
import { deleteColumnController } from '../../../../src/controllers/Columns';

// Định nghĩa kiểu cho params
type Params = {
  id: string;
};

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteColumnController(id);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}