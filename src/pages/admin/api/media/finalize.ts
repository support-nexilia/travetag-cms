import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { finalizeMedia } from '@/services/media';
import { createMedia } from '@/data/media';
import { getSession, isAdmin } from '@/lib/session';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const {
      mediaType,
      tmpKey,
      entity,
      entityId,
      field,
      filename,
      contentType,
      size,
      title,
      alt,
      saveToLibrary = true,
    } = await request.json();

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

    let mediaId: string | null = null;
    if (saveToLibrary) {
      const session = await getSession(cookies);
      const authorId = session?.authorId ? new ObjectId(session.authorId) : undefined;
      const namespace = isAdmin(session) ? undefined : session?.namespace;

      const record = await createMedia({
        type: mediaType,
        file: media,
        original_filename: filename,
        mime_type: contentType,
        size,
        title,
        alt,
        author_id: authorId,
        namespace,
      });
      mediaId = record?._id?.toString() || null;
    }

    return new Response(JSON.stringify({ media, mediaId }), {
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
