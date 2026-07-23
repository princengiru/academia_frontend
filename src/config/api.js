/**
 * API origin for Academia frontends.
 * Production builds must set VITE_API_URL=https://api.gonaraza.com on the host.
 * Falls back to api.gonaraza.com when the page is served from *.gonaraza.com.
 */
export function getApiBaseUrl() {
  const fromEnv = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    if (host === 'academia.gonaraza.com' || host.endsWith('.gonaraza.com')) {
      return 'https://api.gonaraza.com';
    }
  }

  return 'http://localhost:3000';
}

export const API_BASE_URL = getApiBaseUrl();
