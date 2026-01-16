import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { getNotificationById, updateNotification, deleteNotification } from '@/data/notification';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(
        JSON.stringify({ message: 'Notification ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const notification = await getNotificationById(id);
    
    if (!notification) {
      return new Response(
        JSON.stringify({ message: 'Notification not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Convert dates to ISO strings
    const serialized = {
      ...notification,
      _id: notification._id?.toString(),
      author_id: notification.author_id.toString(),
      scheduled_at: notification.scheduled_at?.toISOString(),
      sent_at: notification.sent_at?.toISOString(),
      created_at: notification.created_at.toISOString(),
      updated_at: notification.updated_at.toISOString(),
    };
    
    return new Response(JSON.stringify(serialized), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to fetch notification' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(
        JSON.stringify({ message: 'Notification ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await request.json();
    
    // Convert dates
    if (data.scheduled_at) {
      data.scheduled_at = new Date(data.scheduled_at);
    }
    if (data.image_media_id && typeof data.image_media_id === 'string') {
      data.image_media_id = new ObjectId(data.image_media_id);
    }
    
    // Update notification
    const notification = await updateNotification(id, data);
    
    if (!notification) {
      return new Response(
        JSON.stringify({ message: 'Notification not found or cannot be modified' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ message: 'Notification updated successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return new Response(
      JSON.stringify({ message: error.message || 'Failed to update notification' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(
        JSON.stringify({ message: 'Notification ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const success = await deleteNotification(id);
    
    if (!success) {
      return new Response(
        JSON.stringify({ message: 'Notification not found or cannot be deleted' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ message: 'Notification deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return new Response(
      JSON.stringify({ message: error.message || 'Failed to delete notification' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
