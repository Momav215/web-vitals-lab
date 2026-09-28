import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const raw = await request.text();
  let event = 'unknown';
  try {
    const body = JSON.parse(raw) as { event?: string };
    event = body.event ?? 'unknown';
  } catch {
    event = 'unparsed';
  }

  return NextResponse.json({ accepted: true, event }, { status: 202 });
}
