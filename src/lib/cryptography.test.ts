import { describe, it, expect } from 'vitest'
import { signArchive, verifySignature, generateHash } from '@/lib/cryptography'

describe('cryptography', () => {
  it('signArchive and verifySignature agree for same buffer', async () => {
    const buf = Buffer.from('hello-world')
    const sig = await signArchive(buf)
    const ok = await verifySignature(buf, sig)
    expect(ok).toBe(true)
  })

  it('verifySignature fails for different content', async () => {
    const a = Buffer.from('a')
    const b = Buffer.from('b')
    const sigA = await signArchive(a)
    const ok = await verifySignature(b, sigA)
    expect(ok).toBe(false)
  })

  it('generateHash produces 64-hex characters', () => {
    const h = generateHash(Buffer.from('hash-me'))
    expect(/^[0-9a-f]{64}$/.test(h)).toBe(true)
  })
})

