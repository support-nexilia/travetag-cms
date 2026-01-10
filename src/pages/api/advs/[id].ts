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
    const adv = await updateAdv(params.id!, data);
    return new Response(JSON.stringify(adv), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update adv' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    await deleteAdv(params.id!, true);
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
