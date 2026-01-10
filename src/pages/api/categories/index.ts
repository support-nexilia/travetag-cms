import type { APIRoute } from 'astro';
import { createCategory, getAllCategories } from '@/data/category';

export const GET: APIRoute = async () => {
  try {
    const categories = await getAllCategories();
    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
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
    const category = await createCategory(data);
    return new Response(JSON.stringify(category), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create category' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
