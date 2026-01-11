import type { APIRoute } from 'astro';
import { getAdvById, updateAdv, deleteAdv } from '@/data/adv';

export const GET: APIRoute = async ({ params }) => {
  try {
    const adv = await getAdvById(params.id!);
    if (!adv) {
      return new Response(JSON.stringify({ error: 'Adv not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    return new Response(JSON.stringify(adv), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch adv' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const data = await request.json();
    
    // Convert date strings to Date objects
    if (data.start_date) data.start_date = new Date(data.start_date);
    if (data.end_date) data.end_date = new Date(data.end_date);
    if (data.published_date) data.published_date = new Date(data.published_date);
    
    const adv = await updateAdv(params.id!, data);
    return new Response(JSON.stringify(adv), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to update adv:', error);
    return new Response(JSON.stringify({ error: 'Failed to update adv', message: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    await deleteAdv(params.id!);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete adv' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
