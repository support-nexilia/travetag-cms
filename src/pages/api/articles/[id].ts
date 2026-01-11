import type { APIRoute } from 'astro';
import { getArticleById, updateArticle, deleteArticle } from '@/data/article';
import { UpdateArticleSchema } from '@/entities/article';

export const GET: APIRoute = async ({ params }) => {
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

export const PUT: APIRoute = async ({ params, request }) => {
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

    const data = await request.json();
    
    // Validate data
    const validatedData = UpdateArticleSchema.parse(data);
    
    const article = await updateArticle(id, validatedData);
    
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

export const DELETE: APIRoute = async ({ params }) => {
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

    const article = await deleteArticle(id);
    
    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

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
