'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/lib/env';

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string;
  const adminPassword = env.ADMIN_PASSWORD;

  if (password === adminPassword) {
    // Set a cookie that expires in 24 hours
    cookies().set('admin_auth', 'true', {
      httpOnly: true,
      secure: env.IS_PRODUCTION,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    
    redirect('/admin/targets');
  } else {
    return { error: 'Invalid password' };
  }
}

export async function logoutAction() {
  cookies().delete('admin_auth');
  redirect('/admin/login');
}
