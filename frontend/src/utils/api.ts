/**
 * Centralized API base URL.
 * - In local dev: empty string '' → Vite proxy forwards /api/* to localhost:3000
 * - In production (Vercel): set VITE_API_BASE_URL=https://career-5cyc.onrender.com
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Build a full API URL from a path (e.g. '/api/ai/notes-generator')
 */
export const apiUrl = (path: string) => `${API_BASE}${path}`;
