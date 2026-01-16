import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { getAllNotifications, createNotification } from '@/data/notification';
import { NotificationInputSchema } from '@/entities/notification';

export const GET: APIRoute = async () => {
  try {
    const notifications = await getAllNotifications(undefined, true);
    
    // Convert dates to ISO strings for JSON
    const serialized = notifications.map(n => ({
      ...n,
      _id: n._id?.toString(),
      author_id: n.author_id.toString(),
      scheduled_at: n.scheduled_at?.toISOString(),
      sent_at: n.sent_at?.toISOString(),
      created_at: n.created_at.toISOString(),
      updated_at: n.updated_at.toISOString(),
    }));
    
    return new Response(JSON.stringify(serialized), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to fetch notifications' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Convert author_id to ObjectId
    if (data.author_id) {
      data.author_id = new ObjectId(data.author_id);
    }
    if (data.image_media_id && typeof data.image_media_id === 'string') {
      data.image_media_id = new ObjectId(data.image_media_id);
    }
    
    // Convert dates
    if (data.scheduled_at) {
      data.scheduled_at = new Date(data.scheduled_at);
    }
    
    // Validate input
    const validated = NotificationInputSchema.parse(data);
    
    // Create notification
    const notification = await createNotification(validated);
    
    return new Response(
      JSON.stringify({ 
        id: notification._id?.toString(),
        message: 'Notification created successfully' 
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return new Response(
      JSON.stringify({ message: error.message || 'Failed to create notification' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
