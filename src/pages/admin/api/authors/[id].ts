import type { APIRoute } from 'astro';
import { getAuthorById, updateAuthor, deleteAuthor } from '@/data/author';
import { UpdateAuthorSchema } from '@/entities/author';
import { ObjectId } from 'mongodb';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Author ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const author = await getAuthorById(id);
    
    if (!author) {
      return new Response(JSON.stringify({ error: 'Author not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(author), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching author:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch author' }), {
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
      return new Response(JSON.stringify({ error: 'Author ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const data = await request.json();
    const unsetFields: string[] = [];
    
    ['image_media_id', 'background_image_media_id'].forEach((field) => {
      if (data[field] === null) {
        unsetFields.push(field);
        delete data[field];
        return;
      }
      if (data[field] && typeof data[field] === 'string') {
        data[field] = new ObjectId(data[field]);
      }
    });
    
    // Validate data
    const validatedData = UpdateAuthorSchema.parse(data);
    
    const author = await updateAuthor(id, validatedData, unsetFields);
    
    if (!author) {
      return new Response(JSON.stringify({ error: 'Author not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(author), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error updating author:', error);
    
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
      error: 'Failed to update author',
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
      return new Response(JSON.stringify({ error: 'Author ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const author = await deleteAuthor(id);
    
    if (!author) {
      return new Response(JSON.stringify({ error: 'Author not found' }), {
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
    console.error('Error deleting author:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete author' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
