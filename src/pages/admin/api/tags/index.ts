import type { APIRoute } from 'astro';
import { createTag, getAllTags } from '@/data/tag';

export const GET: APIRoute = async () => {
  try {
    const tags = await getAllTags();
    return new Response(JSON.stringify(tags), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch tags' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const tag = await createTag(data);
    return new Response(JSON.stringify(tag), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create tag' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
