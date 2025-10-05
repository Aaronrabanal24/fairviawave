import { headers } from 'next/headers'

export function absoluteUrl(path: string) {
  const h = headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host =
    h.get('x-forwarded-host') ??
    h.get('host') ??
    process.env.VERCEL_URL ??
    'localhost:3000'

  const base =
    process.env.PRODUCTION_URL ??
    `${proto}://${host}`

  return new URL(path.startsWith('/') ? path : `/${path}`, base).toString()
}
