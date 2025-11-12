import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({
    message: 'Chat endpoint - Coming in Phase 4',
    status: 'placeholder'
  });
}
