import { NextResponse } from 'next/server';
import { redis, LINK_KEY } from '../../../lib/redis';

export async function GET(_req, { params }) {
  const slug = String(params?.slug || '').replace(/[^a-zA-Z0-9_-]/g, '');

  const record = await redis.hget(LINK_KEY, slug);

  if (!record) {
    return new NextResponse('Short link not found.', { status: 404 });
  }

  const updated = {
    ...record,
    clicks: Number(record.clicks || 0) + 1,
    lastClickAt: Date.now()
  };

  await redis.hset(LINK_KEY, {
    [slug]: updated
  });

  return NextResponse.redirect(updated.destination, 302);
}
