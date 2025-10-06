import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fairvia Wave - Property Management',
  description: 'Advanced property management dashboard with analytics and tenant engagement',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
