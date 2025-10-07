export default function Head() {
  let href: string | null = null
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  try {
    if (supabaseUrl) {
      const u = new URL(supabaseUrl)
      href = `${u.protocol}//${u.host}`
    }
  } catch {}

  return (
    <>
      {href && <link rel="preconnect" href={href} crossOrigin="" />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </>
  )
}

