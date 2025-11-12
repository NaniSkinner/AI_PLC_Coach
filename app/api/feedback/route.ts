import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({
    message: 'Feedback endpoint - Coming in Phase 7',
    status: 'placeholder'
  });
}
