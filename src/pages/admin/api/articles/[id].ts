import type { APIRoute } from 'astro';
import { getArticleById, updateArticle, deleteArticle } from '@/data/article';
import { UpdateArticleSchema } from '@/entities/article';
import { getSession, isAdmin, canAccessNamespace } from '@/lib/session';
import { applyNullFields, normalizeArticleInput } from '@/utils/article-input';

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
    
    const normalized = normalizeArticleInput(data);
    const validatedData = UpdateArticleSchema.parse(normalized.data);
    const payload = applyNullFields(validatedData, normalized.nullFields);

    const article = await updateArticle(id, payload);
    
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

    if (error.name === 'ValidationError') {
      return new Response(JSON.stringify({ 
        error: 'Validation error',
        message: error.message,
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
