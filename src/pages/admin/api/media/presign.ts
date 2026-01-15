import type { APIRoute } from 'astro';
import { createPresignedUpload } from '@/services/media';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { filename, contentType, tmpPrefix } = await request.json();

    if (!filename || !contentType) {
      return new Response(JSON.stringify({ error: 'filename and contentType are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const presigned = await createPresignedUpload({
      filename,
      contentType,
      tmpPrefix,
    });

    return new Response(JSON.stringify(presigned), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error creating presigned upload:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create presigned upload',
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
