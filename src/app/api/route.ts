import { auth } from './auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return new NextResponse(JSON.stringify({ authenticated: false }), {
      status: 401,
    });
  }

  return NextResponse.json({
    authenticated: !!session,
  });
}
