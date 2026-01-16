import type { APIRoute } from 'astro';
import { createTag, getAllTags } from '@/data/tag';
import { ObjectId } from 'mongodb';

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
    if (data.image_media_id && typeof data.image_media_id === 'string') {
      data.image_media_id = new ObjectId(data.image_media_id);
    }
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
