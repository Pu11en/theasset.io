import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple health check response
    return NextResponse.json(
      { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'asset-marketing-studio'
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        service: 'asset-marketing-studio'
      },
      { status: 500 }
    );
  }
}