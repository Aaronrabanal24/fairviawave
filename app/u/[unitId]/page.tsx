import Link from 'next/link'

export const dynamic = 'force-dynamic'

type PublicEvent = {
  id: string
  type: string
  timestamp: string
  content?: string
  metadata: Record<string, unknown>
}

type TimelineResponse = {
  id: string
  name: string
  description: string | null
  publishedAt: string | null
  events: PublicEvent[]
  pagination?: {
    page: number
    pageSize: number
    totalEvents: number
    totalPages: number
  }
}

function typeColor(type: string) {
  switch (type) {
    case 'status_change':
      return 'bg-blue-600'
    case 'inquiry':
    case 'inquiry_received':
      return 'bg-emerald-600'
    case 'tour':
      return 'bg-purple-600'
    case 'application':
      return 'bg-indigo-600'
    case 'lease':
      return 'bg-teal-600'
    case 'deposit':
      return 'bg-amber-600'
    default:
      return 'bg-gray-400'
  }
}

export default async function PublicTimelinePage({
  params,
  searchParams,
}: {
  params: { unitId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = Math.max(1, parseInt(String(searchParams.page ?? '1'), 10) || 1)
  const pageSize = Math.min(50, Math.max(1, parseInt(String(searchParams.page_size ?? '20'), 10) || 20))

  const res = await fetch(
    `/api/units/${encodeURIComponent(params.unitId)}/timeline/public?page=${page}&page_size=${pageSize}`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Unit Timeline</h1>
          <p className="mt-4 p-4 rounded bg-red-50 text-red-700">
            Failed to load timeline. Please try again later.
          </p>
        </div>
      </main>
    )
  }

  const data = (await res.json()) as TimelineResponse

  return (
    <main id="main" className="min-h-screen p-4 md:p-8">
      <a href="#timeline" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:px-3 focus:py-2 focus:bg-yellow-200 focus:text-black rounded">
        Skip to timeline
      </a>
      <div className="max-w-2xl mx-auto">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{data.name}</h1>
          {data.description && (
            <p className="mt-2 text-gray-700">{data.description}</p>
          )}
          {data.publishedAt && (
            <p className="mt-1 text-sm text-gray-500">Published {new Date(data.publishedAt).toLocaleString()}</p>
          )}
        </header>

        <section id="timeline" aria-label="Public timeline" className="mt-6">
          {data.events.length === 0 ? (
            <p className="text-gray-600">No public activity yet.</p>
          ) : (
            <ol role="list" className="relative border-l border-gray-200 pl-4">
              {data.events.map((e) => (
                <li key={e.id} className="mb-6 ml-2">
                  <span
                    className={`absolute -left-1.5 mt-2 h-3 w-3 rounded-full ${typeColor(e.type)}`}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                        {e.type}
                      </span>
                      <time className="text-xs text-gray-500" dateTime={e.timestamp}>
                        {new Date(e.timestamp).toLocaleString()}
                      </time>
                    </div>
                    {e.content && (
                      <p className="mt-1 text-gray-800">{e.content}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {data.pagination && data.pagination.totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-6 flex items-center justify-between">
            <Link
              href={`/u/${encodeURIComponent(params.unitId)}?page=${Math.max(1, page - 1)}&page_size=${pageSize}`}
              aria-disabled={page <= 1}
              className={`px-3 py-1 rounded border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                page <= 1 ? 'pointer-events-none opacity-50 border-gray-200 text-gray-400' : 'border-gray-300 text-gray-800 hover:bg-gray-50'
              }`}
            >
              Previous
            </Link>
            <p className="text-sm text-gray-600">
              Page {page} of {Math.max(1, data.pagination.totalPages)}
            </p>
            <Link
              href={`/u/${encodeURIComponent(params.unitId)}?page=${Math.min(
                data.pagination.totalPages,
                page + 1
              )}&page_size=${pageSize}`}
              aria-disabled={page >= data.pagination.totalPages}
              className={`px-3 py-1 rounded border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                page >= data.pagination.totalPages
                  ? 'pointer-events-none opacity-50 border-gray-200 text-gray-400'
                  : 'border-gray-300 text-gray-800 hover:bg-gray-50'
              }`}
            >
              Next
            </Link>
          </nav>
        )}

        <footer className="mt-10 text-xs text-gray-500">
          <p>
            PII-safe public events. For internal details, use your API key on the internal timeline endpoint.
          </p>
        </footer>
      </div>
    </main>
  )
}

