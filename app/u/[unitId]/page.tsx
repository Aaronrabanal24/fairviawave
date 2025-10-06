import Link from 'next/link'
import { absoluteUrl } from '@/lib/absolute-url'

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

  const url = absoluteUrl(
    `/api/units/${encodeURIComponent(params.unitId)}/timeline/public?page=${page}&page_size=${pageSize}`
  )

  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    return (
      <main className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Unit Timeline</h1>
          <div 
            className="mt-4 p-4 sm:p-6 rounded-lg bg-red-50 text-red-700 border border-red-200"
            role="alert"
            aria-live="polite"
          >
            <p className="font-semibold mb-1">Failed to load timeline</p>
            <p className="text-sm">Please try again later or contact support if the problem persists.</p>
          </div>
        </div>
      </main>
    )
  }

  const data = (await res.json()) as TimelineResponse

  return (
    <main id="main" className="min-h-screen p-4 sm:p-6 md:p-8">
      <a 
        href="#timeline" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-3 focus:bg-yellow-200 focus:text-black focus:font-semibold rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
      >
        Skip to timeline
      </a>
      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 break-words">{data.name}</h1>
          {!!data.description && (
            <p className="mt-2 text-base sm:text-lg text-gray-700 leading-relaxed">{data.description}</p>
          )}
          {!!data.publishedAt && (
            <p className="mt-1 text-sm text-gray-500">
              <span className="sr-only">Published on </span>
              Published {new Date(data.publishedAt).toLocaleString()}
            </p>
          )}
        </header>

        <section id="timeline" aria-label="Public timeline" className="mt-6">
          {data.events.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No public activity yet.</p>
          ) : (
            <ol role="list" className="relative border-l-2 border-gray-200 pl-4 sm:pl-6">
              {data.events.map((e) => (
                <li key={e.id} className="mb-8 ml-2 sm:ml-4">
                  <span
                    className={`absolute -left-2 sm:-left-2.5 mt-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full ${typeColor(e.type)} border-2 border-white`}
                    aria-hidden="true"
                  />
                  <article className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span 
                        className="inline-flex items-center rounded px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800"
                        role="status"
                      >
                        {e.type}
                      </span>
                      <time className="text-xs text-gray-500" dateTime={e.timestamp}>
                        {new Date(e.timestamp).toLocaleString()}
                      </time>
                    </div>
                    {!!e.content && (
                      <p className="mt-2 text-sm sm:text-base text-gray-800 leading-relaxed">{e.content}</p>
                    )}
                  </article>
                </li>
              ))}
            </ol>
          )}
        </section>

        {!!(data.pagination && data.pagination.totalPages > 1) && (
          <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
            <Link
              href={`/u/${encodeURIComponent(params.unitId)}?page=${Math.max(1, page - 1)}&page_size=${pageSize}`}
              aria-disabled={page <= 1}
              aria-label={page <= 1 ? 'Previous page (disabled)' : 'Go to previous page'}
              className={`px-4 py-2.5 rounded-lg border font-medium text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors min-h-[44px] ${
                page <= 1 ? 'pointer-events-none opacity-50 border-gray-200 text-gray-400' : 'border-gray-300 text-gray-800 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              Previous
            </Link>
            <p className="text-sm sm:text-base text-gray-600 font-medium" aria-live="polite" aria-atomic="true">
              <span className="sr-only">Currently on </span>Page {page} of {Math.max(1, data.pagination.totalPages)}
            </p>
            <Link
              href={`/u/${encodeURIComponent(params.unitId)}?page=${Math.min(
                data.pagination.totalPages,
                page + 1
              )}&page_size=${pageSize}`}
              aria-disabled={page >= data.pagination.totalPages}
              aria-label={page >= data.pagination.totalPages ? 'Next page (disabled)' : 'Go to next page'}
              className={`px-4 py-2.5 rounded-lg border font-medium text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors min-h-[44px] ${
                page >= data.pagination.totalPages
                  ? 'pointer-events-none opacity-50 border-gray-200 text-gray-400'
                  : 'border-gray-300 text-gray-800 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              Next
            </Link>
          </nav>
        )}

        <footer className="mt-10 pt-6 border-t border-gray-200 text-xs sm:text-sm text-gray-500">
          <p className="text-center">
            PII-safe public events. For internal details, use your API key on the internal timeline endpoint.
          </p>
        </footer>
      </div>
    </main>
  )
}

