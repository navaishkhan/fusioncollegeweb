import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh token if expired
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protect portal routes
  const protectedRoutes = ['/admin', '/teacher', '/student', '/parent'];
  const isProtected = protectedRoutes.some(route => path.startsWith(route));

  if (isProtected) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Role-based route guard - fetch role from database
    let userRole = 'student';
    try {
      const dbUser = await prisma.user.findUnique({
        where: { authId: user.id },
        select: { role: true },
      });
      userRole = dbUser?.role?.toLowerCase() || 'student';
    } catch (err) {
      console.error('Error fetching user role:', err);
    }

    // e.g. If user role is STUDENT, they should not access /admin or /teacher
    const isAuthorized = path.startsWith(`/${userRole}`);
    if (!isAuthorized) {
      const url = request.nextUrl.clone();
      url.pathname = `/${userRole}`;
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from the login page
  if (path === '/login' && user) {
    let userRole = 'student';
    try {
      const dbUser = await prisma.user.findUnique({
        where: { authId: user.id },
        select: { role: true },
      });
      userRole = dbUser?.role?.toLowerCase() || 'student';
    } catch (err) {
      console.error('Error fetching user role:', err);
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${userRole}`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
