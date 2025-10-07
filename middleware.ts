import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Run middleware on app pages only — NEVER on API or Next internals.
export const config = {
  matcher: [
    // Everything except /api, Next internals, and common static assets
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|css|js|map)$).*)",
  ],
};

export async function middleware(request: NextRequest) {
  // Belt-and-suspenders: if this still sees /api, let it pass untouched.
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated and trying to access protected routes (only in production)
  if (process.env.NODE_ENV === 'production' && !user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if authenticated and trying to access login (only in production)
  if (process.env.NODE_ENV === 'production' && user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  supabaseResponse.headers.set("x-fairvia-mw", "pass");
  return supabaseResponse
}
