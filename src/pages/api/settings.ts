import type { APIRoute } from 'astro';
import { getAppSettings, updateAppSettings } from '@/data/app-settings';

export const GET: APIRoute = async () => {
  try {
    const settings = await getAppSettings();
    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch settings' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const settings = await updateAppSettings(data);
    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to update settings', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
