import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-center">
        <h1 className="text-4xl font-bold mb-8">Fairvia Wave 1</h1>
        <p className="mb-8">Focus MVP - Unit Management System</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
