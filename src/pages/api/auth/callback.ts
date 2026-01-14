import type { APIRoute } from 'astro';
import { handleCallback, parseRoles } from '@/lib/oidc-manual';
import { createOrUpdateAuthorFromOidc } from '@/data/author';
import { setSession } from '@/lib/session';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    // Validate state
    const storedState = cookies.get('oidc_state')?.value;
    if (!state || !storedState || state !== storedState) {
      return new Response('Invalid state', { status: 400 });
    }

    // Get code verifier
    const codeVerifier = cookies.get('oidc_code_verifier')?.value;
    if (!codeVerifier) {
      return new Response('Missing code verifier', { status: 400 });
    }

    // Clear cookies
    cookies.delete('oidc_state');
    cookies.delete('oidc_code_verifier');

    if (!code) {
      return new Response('Missing code', { status: 400 });
    }

    // Exchange code for tokens and get user info
    const userInfo = await handleCallback(code, codeVerifier);

    // Parse roles from OIDC token
    const parsedRole = parseRoles(userInfo.roles);
    
    if (!parsedRole) {
      return new Response('No valid role found in OIDC token. Expected roles: admin, traveltag:namespace:editor, or traveltag:namespace:tourleader', { status: 403 });
    }

    // Create or update author
    const author = await createOrUpdateAuthorFromOidc({
      oidc_sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      role: parsedRole.role,
      namespace: parsedRole.namespace,
    });

    // Set session
    await setSession(cookies, {
      authorId: author._id.toString(),
      email: author.email,
      name: author.name,
      role: author.role!,
      namespace: author.namespace,
    });

    // Redirect to admin
    return redirect('/admin');
  } catch (error) {
    console.error('OIDC callback error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
};
