import type { APIRoute } from 'astro';
import { createAdv, getAllAdvs } from '@/data/adv';

export const GET: APIRoute = async () => {
  try {
    const advs = await getAllAdvs();
    return new Response(JSON.stringify(advs), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch advs' }), {
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
    const adv = await createAdv(data);
    return new Response(JSON.stringify(adv), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create adv' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
