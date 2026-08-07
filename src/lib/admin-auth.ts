import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from './admin-session';

export async function requireAdmin() {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;

  if (!(await verifyAdminSession(session))) {
    redirect('/admin/login');
  }
}
