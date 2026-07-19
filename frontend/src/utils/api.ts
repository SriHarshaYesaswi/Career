/**
 * Centralized API base URL.
 * - In local dev: empty string '' → Vite proxy forwards /api/* to localhost:3000
 * - In production: set VITE_API_BASE_URL to the Render backend URL
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://career-5cyc.onrender.com' : '');

/**
 * Build a full API URL from a path (e.g. '/api/ai/notes-generator')
 */
export const apiUrl = (path: string) => `${API_BASE}${path}`;
