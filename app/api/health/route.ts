import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    phase: 'Phase 1: Foundation Setup',
    version: '0.1.0'
  });
}
