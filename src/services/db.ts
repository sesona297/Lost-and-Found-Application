const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Replaces PGlite query runner with HTTP fetch calls to Express/MySQL
export async function queryApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.statusText}`);
  }

  return response.json();
}