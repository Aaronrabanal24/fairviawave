import '@testing-library/jest-dom/vitest'
import React from 'react'
import { cleanup } from '@testing-library/react'
import { TextDecoder, TextEncoder } from 'node:util'
import { webcrypto } from 'node:crypto'
import { fetch, Headers, Request, Response, FormData, File, Blob } from 'undici'
import { afterEach, vi } from 'vitest'

import { resetNextNavigationMocks } from './__mocks__/next/navigation'
import { resetNextHeadersMocks } from './__mocks__/next/headers'
import { resetMockSupabaseClient } from './__mocks__/@/lib/supabaseClient'

// Fetch API polyfill
if (!globalThis.fetch) {
  globalThis.fetch = fetch as unknown as typeof globalThis.fetch
}

if (!globalThis.Headers) {
  globalThis.Headers = Headers as unknown as typeof globalThis.Headers
}

if (!globalThis.Request) {
  globalThis.Request = Request as unknown as typeof globalThis.Request
}

if (!globalThis.Response) {
  globalThis.Response = Response as unknown as typeof globalThis.Response
}

if (!globalThis.FormData) {
  globalThis.FormData = FormData as unknown as typeof globalThis.FormData
}

if (!globalThis.File) {
  globalThis.File = File as unknown as typeof globalThis.File
}

if (!globalThis.Blob) {
  globalThis.Blob = Blob as unknown as typeof globalThis.Blob
}

// TextEncoder/TextDecoder polyfills
if (!globalThis.TextEncoder) {
  ;(globalThis as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder = TextEncoder
}

if (!globalThis.TextDecoder) {
  ;(globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder
}

// Crypto polyfill
if (!globalThis.crypto) {
  ;(globalThis as unknown as { crypto: Crypto }).crypto = webcrypto as unknown as Crypto
}

if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = webcrypto.randomUUID.bind(webcrypto)
}

if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = webcrypto.getRandomValues.bind(webcrypto)
}

declare global {
  // eslint-disable-next-line no-var -- needed to augment the Node global scope for Vitest
  var IS_REACT_ACT_ENVIRONMENT: boolean
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// ResizeObserver mock
class ResizeObserverMock implements ResizeObserver {
  callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe(): void {
    // no-op
  }

  unobserve(): void {
    // no-op
  }

  disconnect(): void {
    // no-op
  }
}

if (!globalThis.ResizeObserver) {
  ;(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = ResizeObserverMock
}

// IntersectionObserver mock
class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = []

  constructor(public readonly callback: IntersectionObserverCallback) {}

  observe(): void {
    // no-op
  }

  unobserve(): void {
    // no-op
  }

  disconnect(): void {
    // no-op
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

if (!globalThis.IntersectionObserver) {
  ;(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver = IntersectionObserverMock
}

// matchMedia mock
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

// Next.js image mock
vi.mock('next/image', () => {
  const MockedImage = React.forwardRef<HTMLImageElement, React.ComponentProps<'img'>>(
    (props, ref) => React.createElement('img', { ref, ...props })
  )

  MockedImage.displayName = 'NextImage'

  return {
    __esModule: true,
    default: MockedImage,
  }
})

afterEach(() => {
  cleanup()
  resetNextNavigationMocks()
  resetNextHeadersMocks()
  resetMockSupabaseClient()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})
