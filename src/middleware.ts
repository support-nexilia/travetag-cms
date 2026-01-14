import { defineMiddleware } from 'astro:middleware';
import { getSession } from '@/lib/session';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Skip authentication for public routes
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/graphql') ||
    !pathname.startsWith('/admin')
  ) {
    return next();
  }

  // Check session for /admin routes
  const session = await getSession(context.cookies);

  if (!session.isLoggedIn) {
    // Redirect to login if not authenticated
    return context.redirect('/login');
  }

  // Add session to locals for use in pages
  context.locals.session = session;

  return next();
});
