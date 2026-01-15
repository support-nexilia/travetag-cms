import type { APIRoute } from 'astro';
import { finalizeMedia } from '@/services/media';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { mediaType, tmpKey, entity, entityId, field, filename, contentType } =
      await request.json();

    if (!mediaType || !tmpKey || !entity || !entityId || !field) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const media = await finalizeMedia({
      mediaType,
      tmpKey,
      entity,
      entityId,
      field,
      filename,
      contentType,
    });

    return new Response(JSON.stringify({ media }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error finalizing media:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to finalize media',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
};
