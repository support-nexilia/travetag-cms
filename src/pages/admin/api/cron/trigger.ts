import type { APIRoute } from 'astro';
import { publishScheduledContent } from '@/services/cron';
import { isAdmin } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if user is admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const result = await publishScheduledContent();
    
    return new Response(JSON.stringify({
      success: true,
      message: `Published ${result.publishedPosts} posts and ${result.publishedAdvs} advs`,
      ...result,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in cron trigger:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to trigger scheduled publication',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
