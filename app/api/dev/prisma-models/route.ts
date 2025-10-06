import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }
  
  try {
    const delegates = Object.keys(prisma)
      .filter(k => typeof (prisma as any)[k]?.findFirst === 'function');
    
    return NextResponse.json({ delegates });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check prisma models' }, 
      { status: 500 }
    );
  }
}
