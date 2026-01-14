import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { getArticleById, updateArticle, deleteArticle } from '@/data/article';
import { getSession, isAdmin, canAccessNamespace } from '@/lib/session';

export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Article ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const article = await getArticleById(id);
    
    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check namespace access
    const session = await getSession(cookies);
    if (!canAccessNamespace(session, article.namespace)) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(article), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch article' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Article ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if article exists and user has access
    const existingArticle = await getArticleById(id);
    if (!existingArticle) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const session = await getSession(cookies);
    if (!canAccessNamespace(session, existingArticle.namespace)) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const data = await request.json();
    
    // Prevent namespace changes for non-admin users
    if (!isAdmin(session) && data.namespace && data.namespace !== existingArticle.namespace) {
      return new Response(JSON.stringify({ error: 'Cannot change namespace' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Convert ObjectIds
    if (data.author_id && typeof data.author_id === 'string') {
      data.author_id = new ObjectId(data.author_id);
    }
    if (data.tour_leader_id && typeof data.tour_leader_id === 'string') {
      data.tour_leader_id = new ObjectId(data.tour_leader_id);
    }
    if (data.category_id && typeof data.category_id === 'string') {
      data.category_id = parseInt(data.category_id);
    }
    if (data.tag_ids && Array.isArray(data.tag_ids)) {
      data.tag_ids = data.tag_ids.map((id: any) => 
        typeof id === 'string' ? new ObjectId(id) : id
      );
    }
    
    // Convert dates
    if (data.published_date && typeof data.published_date === 'string') {
      data.published_date = new Date(data.published_date);
    }
    if (data.date && typeof data.date === 'string') {
      data.date = new Date(data.date);
    }
    if (data.start_date && typeof data.start_date === 'string') {
      data.start_date = new Date(data.start_date);
    }
    if (data.end_date && typeof data.end_date === 'string') {
      data.end_date = new Date(data.end_date);
    }
    if (data.deadline_date && typeof data.deadline_date === 'string') {
      data.deadline_date = new Date(data.deadline_date);
    }
    
    // Convert numbers for BOOK_NOW type
    const numberFields = [
      'duration_days', 'min_people', 'max_people', 'max_booking_num',
      'travelers_adults_min', 'travelers_adults_max',
      'travelers_children_min', 'travelers_children_max',
      'travelers_couples_min', 'travelers_couples_max',
      'travelers_newborns_min', 'travelers_newborns_max'
    ];
    const priceFields = [
      'price_adults', 'price_children', 'price_couples', 'price_newborns'
    ];
    
    numberFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        const parsed = typeof data[field] === 'string' ? parseFloat(data[field]) : data[field];
        data[field] = isNaN(parsed) ? undefined : parsed;
      }
    });
    
    // Price fields need rounding to 2 decimals to avoid floating point errors
    priceFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        const parsed = typeof data[field] === 'string' ? parseFloat(data[field]) : data[field];
        data[field] = isNaN(parsed) ? undefined : Math.round(parsed * 100) / 100;
      }
    });
    
    // Convert booleans for travelers
    const booleanFields = [
      'travelers_adults_allowed', 'travelers_children_allowed',
      'travelers_couples_allowed', 'travelers_newborns_allowed'
    ];
    booleanFields.forEach(field => {
      if (data[field] !== undefined) {
        if (typeof data[field] === 'string') {
          data[field] = data[field] === 'true' || data[field] === 'on';
        } else if (typeof data[field] === 'boolean') {
          // Already boolean, keep as is
        } else {
          data[field] = false;
        }
      }
    });
    
    // Parse JSON fields
    if (data.type_of_trip_items && typeof data.type_of_trip_items === 'string') {
      try {
        data.type_of_trip_items = JSON.parse(data.type_of_trip_items);
      } catch (e) {
        data.type_of_trip_items = undefined;
      }
    }
    
    // Convert itinerary items order (remove null values)
    if (data.itinerary_items && Array.isArray(data.itinerary_items)) {
      data.itinerary_items = data.itinerary_items.map((item: any, index: number) => ({
        ...item,
        order: item.order ?? index,
      }));
    }
    
    // Remove undefined values to avoid issues
    Object.keys(data).forEach(key => {
      if (data[key] === undefined || data[key] === '') {
        delete data[key];
      }
    });
    
    // Don't validate with Zod for updates - just pass the data
    const article = await updateArticle(id, data);
    
    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(article), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error updating article:', error);
    
    if (error.name === 'ZodError') {
      return new Response(JSON.stringify({ 
        error: 'Validation error', 
        details: error.errors 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Failed to update article',
      message: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Article ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if article exists and user has access
    const existingArticle = await getArticleById(id);
    if (!existingArticle) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const session = await getSession(cookies);
    if (!canAccessNamespace(session, existingArticle.namespace)) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const article = await deleteArticle(id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete article' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
