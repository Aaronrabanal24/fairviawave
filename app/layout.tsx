import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fairvia Wave 1',
  description: 'Focus MVP - Unit Management',
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
