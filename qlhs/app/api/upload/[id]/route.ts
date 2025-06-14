import { NextRequest, NextResponse } from 'next/server';
import { deleteRowController, updateRowController } from '../../../../src/controllers/DataColumns';

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

    const result = await deleteRowController(id);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID is required' },
        { status: 400 }
      );
    }

    const result = await updateRowController(id, req);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}