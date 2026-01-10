import type { AstroCookies } from 'astro';

const HARDCODED_USER = {
  id: '34b8ef28-8ee8-4e80-8252-c13a961ba2fa',
  username: 'coccus',
  email: 'davide.cocco@mosai.co',
  role: 'ADMIN' as const,
};

export function getCurrentUser(cookies: AstroCookies) {
  // In MVP phase, always return hardcoded admin user
  return HARDCODED_USER;
}

export function isAdmin(cookies: AstroCookies) {
  const user = getCurrentUser(cookies);
  return user?.role === 'ADMIN';
}

export function canEditUser(cookies: AstroCookies, userId: string) {
  const user = getCurrentUser(cookies);
  return user?.role === 'ADMIN' || user?.id === userId;
}
