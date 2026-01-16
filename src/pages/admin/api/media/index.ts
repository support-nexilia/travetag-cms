import type { APIRoute } from 'astro';
import { getSession, isAdmin } from '@/lib/session';
import { getMediaList } from '@/data/media';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const session = await getSession(cookies);
    const search = new URL(request.url).searchParams;
    const type = search.get('type') || undefined;
    const limit = parseInt(search.get('limit') || '50', 10);
    const skip = parseInt(search.get('skip') || '0', 10);
    const namespace = isAdmin(session) ? undefined : session.namespace;

    const media = await getMediaList({
      namespace,
      type: type === 'image' || type === 'video' || type === 'file' ? type : undefined,
      limit,
      skip,
    });

    return new Response(JSON.stringify(media), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch media:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
