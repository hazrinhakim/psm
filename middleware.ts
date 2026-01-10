import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { normalizeRole, roleToPath } from './lib/roles'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname
  const isDashboard =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/assistant') ||
    pathname.startsWith('/staff')

  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (user && isDashboard) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    const role = normalizeRole(data?.role)
    const destination = roleToPath(role)

    if (
      (pathname.startsWith('/admin') && role !== 'admin') ||
      (pathname.startsWith('/assistant') && role !== 'admin_assistant') ||
      (pathname.startsWith('/staff') && role !== 'staff')
    ) {
      return NextResponse.redirect(new URL(destination, req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/assistant/:path*', '/staff/:path*'],
}
