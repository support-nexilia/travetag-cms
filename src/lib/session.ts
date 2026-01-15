import type { AstroCookies } from 'astro';
import type { Role } from '@/entities/author';
import jwt from 'jsonwebtoken';
import { IS_PROD, SESSION_SECRET } from '@/lib/env';

export interface SessionData {
  authorId: string;
  email: string;
  name: string;
  role: Role;
  namespace?: string;
  isLoggedIn: boolean;
}

const JWT_SECRET = SESSION_SECRET;
const COOKIE_NAME = 'traveltag_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Get session from JWT cookie (stateless, multi-instance safe)
 */
export async function getSession(cookies: AstroCookies): Promise<SessionData> {
  const token = cookies.get(COOKIE_NAME)?.value;
  
  if (!token) {
    return { isLoggedIn: false } as SessionData;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionData;
    return decoded;
  } catch (error) {
    return { isLoggedIn: false } as SessionData;
  }
}

/**
 * Set session data using JWT (stateless, multi-instance safe)
 */
export async function setSession(
  cookies: AstroCookies,
  data: Omit<SessionData, 'isLoggedIn'>
): Promise<void> {
  const sessionData: SessionData = {
    ...data,
    isLoggedIn: true,
  };

  const token = jwt.sign(sessionData, JWT_SECRET, {
    expiresIn: COOKIE_MAX_AGE,
  });

  cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Clear session
 */
export async function clearSession(cookies: AstroCookies): Promise<void> {
  cookies.delete(COOKIE_NAME, {
    path: '/',
  });
}

/**
 * Check if user is admin
 */
export function isAdmin(session: SessionData): boolean {
  return session.isLoggedIn && session.role === 'admin';
}

/**
 * Check if user can access namespace
 */
export function canAccessNamespace(session: SessionData, namespace?: string): boolean {
  if (!session.isLoggedIn) return false;
  if (session.role === 'admin') return true;
  if (!namespace) return true;
  return session.namespace === namespace;
}
