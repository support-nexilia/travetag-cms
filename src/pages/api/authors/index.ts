import type { APIRoute } from 'astro';
import { getAllAuthors, createAuthor } from '@/data/author';
import { CreateAuthorSchema } from '@/entities/author';

export const GET: APIRoute = async () => {
  try {
    const authors = await getAllAuthors();
    return new Response(JSON.stringify(authors), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching authors:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch authors' }), {
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
    
    // Validate data
    const validatedData = CreateAuthorSchema.parse(data);
    
    const author = await createAuthor(validatedData);
    
    return new Response(JSON.stringify(author), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error creating author:', error);
    
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
      error: 'Failed to create author',
      message: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
