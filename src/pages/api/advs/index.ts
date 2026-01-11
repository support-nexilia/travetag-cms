import type { APIRoute } from 'astro';
import { createAdv, getAllAdvs } from '@/data/adv';

export const GET: APIRoute = async () => {
  try {
    const advs = await getAllAdvs(true); // Include unpublished for admin
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
    
    // Convert date strings to Date objects
    if (data.start_date) data.start_date = new Date(data.start_date);
    if (data.end_date) data.end_date = new Date(data.end_date);
    if (data.published_date) data.published_date = new Date(data.published_date);
    
    const adv = await createAdv(data);
    return new Response(JSON.stringify(adv), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to create adv:', error);
    return new Response(JSON.stringify({ error: 'Failed to create adv', message: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
