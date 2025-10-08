import { describe, it, expect } from 'vitest'
import { createArchive, extractArchiveMetadata, verifyArchiveSignature } from '@/lib/archive'

describe('archive', () => {
  it('creates archive with metadata and verifies signature', async () => {
    const files = [
      { path: 'a.txt', content: Buffer.from('A') },
      { path: 'b.txt', content: Buffer.from('B') },
    ]
    const metadata = { unitId: 'u1', version: '1.0.0' }

    const result = await createArchive(files, metadata)
    expect(Buffer.isBuffer(result.archiveBuffer)).toBe(true)
    expect(typeof result.signature).toBe('string')
    expect(/^[0-9a-f]{64}$/.test(result.signature)).toBe(true)

    const ok = await verifyArchiveSignature(result.archiveBuffer, result.signature)
    expect(ok).toBe(true)

    const meta = await extractArchiveMetadata(result.archiveBuffer)
    expect(meta.unitId).toBe('u1')
    expect(meta.version).toBe('1.0.0')
  })
})

