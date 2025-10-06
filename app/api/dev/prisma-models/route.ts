import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }
  
  try {
    const delegates = Object.keys(prisma)
      .filter(k => prisma[k]?.findFirst instanceof Function);
    
    return NextResponse.json({ delegates });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check prisma models' }, 
      { status: 500 }
    );
  }
}