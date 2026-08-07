'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/lib/env';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
  isAdminSessionConfigured,
} from '@/lib/admin-session';
import { requireAdmin } from '@/lib/admin-auth';
import {
  consumeAdminLoginAttempt,
  resetAdminLoginAttempts,
} from '@/lib/admin-login-rate-limit';

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string;
  const adminPassword = env.ADMIN_PASSWORD;

  if (!adminPassword || !isAdminSessionConfigured()) {
    console.error('Admin authentication is not configured');
    return { error: 'Admin authentication is not configured' };
  }

  const { allowed, identifierHash } = await consumeAdminLoginAttempt();
  if (!allowed) {
    return { error: 'Too many login attempts. Please try again later.' };
  }

  if (password === adminPassword) {
    await resetAdminLoginAttempts(identifierHash);
    const session = await createAdminSession();
    const cookieStore = await cookies();

    cookieStore.set(ADMIN_SESSION_COOKIE, session, {
      httpOnly: true,
      secure: env.IS_PRODUCTION,
      sameSite: 'strict',
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: '/admin',
    });

    cookieStore.set('admin_auth', '', { maxAge: 0, path: '/admin' });
    cookieStore.set('admin_auth', '', { maxAge: 0, path: '/' });

    redirect('/admin/targets');
  } else {
    return { error: 'Invalid password' };
  }
}

export async function logoutAction() {
  await requireAdmin();

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, '', { maxAge: 0, path: '/admin' });
  cookieStore.set('admin_auth', '', { maxAge: 0, path: '/admin' });
  cookieStore.set('admin_auth', '', { maxAge: 0, path: '/' });
  redirect('/admin/login');
}
