import { NextResponse } from 'next/server';
import { redis, LINK_KEY } from '../../../lib/redis';

function cleanSlug(value) {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 48);
}

function validUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET() {
  const all = await redis.hgetall(LINK_KEY);

  const links = Object.values(all || {}).sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );

  return NextResponse.json({ links });
}

export async function POST(req) {
  const body = await req.json();

  const destination = String(body.destination || '').trim();
  let slug = cleanSlug(body.slug);

  if (!validUrl(destination)) {
    return NextResponse.json(
      { error: 'Enter a valid http(s) destination URL.' },
      { status: 400 }
    );
  }

  if (!slug) {
    slug = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
  }

  const existing = await redis.hget(LINK_KEY, slug);

  if (existing) {
    return NextResponse.json(
      { error: 'That short code already exists.' },
      { status: 409 }
    );
  }

  const host = req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';

  const record = {
    slug,
    destination,
    url: `${proto}://${host}/go/${slug}`,
    clicks: 0,
    createdAt: Date.now()
  };

  await redis.hset(LINK_KEY, {
    [slug]: record
  });

  return NextResponse.json(record, { status: 201 });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);

  const slug = cleanSlug(searchParams.get('slug'));

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing slug.' },
      { status: 400 }
    );
  }

  await redis.hdel(LINK_KEY, slug);

  return NextResponse.json({ ok: true });
}
