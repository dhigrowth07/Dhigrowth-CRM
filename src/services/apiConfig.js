// Automatically resolve BACKEND_URL:
// When accessed via localhost or 127.0.0.1, prioritize the local Node backend server (port 4000).
// In production or cloud deployment, use the configured VITE_BACKEND_URL or Render domain.
const isLocalhost =
  typeof window !== 'undefined' &&
  Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.')
  );

export const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  (isLocalhost ? 'http://localhost:4000' : 'https://api-wappilot.dhigrowth.com')
).replace(/\/+$/, '');
