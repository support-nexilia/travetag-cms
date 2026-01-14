import type { Role } from '@/entities/author';

export interface ParsedRole {
  role: Role;
  namespace?: string;
}

interface OIDCConfig {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  issuer: string;
}

let cachedConfig: OIDCConfig | null = null;

/**
 * Get OIDC configuration via discovery
 */
async function getOIDCConfig(): Promise<OIDCConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const discoveryUrl = `${import.meta.env.OIDC_ISSUER}/.well-known/openid-configuration`;
  const response = await fetch(discoveryUrl);
  
  if (!response.ok) {
    throw new Error(`OIDC discovery failed: ${response.statusText}`);
  }

  cachedConfig = await response.json();
  return cachedConfig!;
}

/**
 * Generate random string for state/verifier
 */
function randomString(length: number = 43): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}

/**
 * Generate PKCE code challenge
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Generate authorization URL
 */
export async function getAuthorizationUrl(state: string): Promise<{ url: string; codeVerifier: string }> {
  const config = await getOIDCConfig();
  const codeVerifier = randomString();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    client_id: import.meta.env.OIDC_CLIENT_ID,
    redirect_uri: import.meta.env.OIDC_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile roles',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return {
    url: `${config.authorization_endpoint}?${params}`,
    codeVerifier,
  };
}

/**
 * Exchange code for tokens
 */
export async function handleCallback(
  code: string,
  codeVerifier: string
): Promise<{
  sub: string;
  email: string;
  name: string;
  roles?: string[];
}> {
  const config = await getOIDCConfig();

  // Exchange code for token
  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: import.meta.env.OIDC_REDIRECT_URI,
    client_id: import.meta.env.OIDC_CLIENT_ID,
    client_secret: import.meta.env.OIDC_CLIENT_SECRET,
    code_verifier: codeVerifier,
  });

  const tokenResponse = await fetch(config.token_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenParams.toString(),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token exchange failed:', errorText);
    throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
  }

  const tokens = await tokenResponse.json();

  // Decode ID token (simple decode without validation for now)
  const idTokenParts = tokens.id_token?.split('.');
  let claims: any = {};
  if (idTokenParts && idTokenParts.length === 3) {
    const payload = idTokenParts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    claims = JSON.parse(decoded);
  }

  // Get userinfo
  let userinfo: any = {};
  if (tokens.access_token && config.userinfo_endpoint) {
    try {
      const userinfoResponse = await fetch(config.userinfo_endpoint, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      if (userinfoResponse.ok) {
        userinfo = await userinfoResponse.json();
      }
    } catch (e) {
      console.warn('UserInfo fetch failed:', e);
    }
  }

  // Extract roles from various possible locations
  const roles = userinfo.roles || claims.roles || userinfo.groups || claims.groups || 
                userinfo.realm_access?.roles || claims.realm_access?.roles ||
                userinfo['cognito:groups'] || claims['cognito:groups'];

  // Extract name (try different fields)
  let fullName = userinfo.name || claims.name;
  if (!fullName && (userinfo.given_name || claims.given_name || userinfo.family_name || claims.family_name)) {
    const firstName = userinfo.given_name || claims.given_name || '';
    const lastName = userinfo.family_name || claims.family_name || '';
    fullName = `${firstName} ${lastName}`.trim();
  }
  if (!fullName) {
    fullName = userinfo.preferred_username || claims.preferred_username || userinfo.email || claims.email;
  }

  return {
    sub: claims.sub || userinfo.sub,
    email: userinfo.email || claims.email,
    name: fullName,
    roles: roles,
  };
}

/**
 * Parse roles from OIDC token
 */
export function parseRoles(roles: string[] | undefined): ParsedRole | null {
  if (!roles || roles.length === 0) {
    return null;
  }

  // Check for admin role first
  if (roles.includes('admin')) {
    return { role: 'admin' };
  }

  // Parse traveltag roles
  for (const role of roles) {
    const match = role.match(/^traveltag:([^:]+):(editor|tourleader)$/);
    if (match) {
      const [, namespace, roleType] = match;
      return {
        role: roleType as 'editor' | 'tourleader',
        namespace,
      };
    }
  }

  return null;
}
