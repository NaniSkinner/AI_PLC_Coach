import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    message: `Get session ${id} - Coming in Phase 4`,
    status: 'placeholder'
  });
}
