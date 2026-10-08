import { queryApi } from './db';

export interface LocalUser {
  id: string;
  email: string;
  full_name: string;
  student_number: string | null;
  staff_number: string | null;
  role: 'student' | 'admin';
  phone: string | null;
  created_at: string;
}

interface AuthResponse {
  token: string;
  user: LocalUser;
}

function saveSession(data: AuthResponse) {
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function login(email: string, password: string) {
  return saveSession(await queryApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }));
}

export async function staffLogin(staff_number: string, password: string) {
  return saveSession(await queryApi('/auth/staff-login', { method: 'POST', body: JSON.stringify({ staff_number, password }) }));
}

export async function register(full_name: string, student_number: string, email: string, password: string) {
  return saveSession(await queryApi('/auth/register', { method: 'POST', body: JSON.stringify({ full_name, student_number, email, password }) }));
}

export async function getCurrentUser(): Promise<LocalUser | null> {
  if (!localStorage.getItem('auth_token')) return null;
  try {
    const user = await queryApi('/auth/me');
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch {
    await logout();
    return null;
  }
}

export async function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}

export async function updateProfile(_userId: string, profile: { full_name: string; phone: string | null }) {
  const user = await queryApi('/auth/profile', { method: 'PATCH', body: JSON.stringify(profile) });
  localStorage.setItem('user', JSON.stringify(user));
  return user as LocalUser;
}