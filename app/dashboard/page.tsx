'use client'

import { useEffect, useState, useMemo } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'

const MetricsCard = dynamic(() => import('./metrics'), { ssr: false })

type Unit = {
  id: string
  name: string
  description: string | null
  status: string
  publishedAt: string | null
  createdAt: string
}

export default function DashboardPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [newUnit, setNewUnit] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [selectedUnitId, setSelectedUnitId] = useState<string>('')
  const [publicUrl, setPublicUrl] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const supabase = useMemo(() => createSupabaseClient(), [])
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (mounted) {
        setUser(user)
        if (user) {
          fetchUnits()
        }
        setLoading(false)
      }
    }
    loadUser()
    return () => {
      mounted = false
    }
  }, [])

  const fetchUnits = async () => {
    const res = await fetch('/api/units')
    if (res.ok) {
      const data = await res.json()
      setUnits(data)
    }
  }

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUnit),
      })
      if (res.ok) {
        const unit = await res.json()
        setUnits([unit, ...units])
        setNewUnit({ name: '', description: '' })
        setSelectedUnitId(unit.id)
      }
    } finally {
      setCreating(false)
    }
  }

  const handlePublish = async (unitId: string) => {
    const res = await fetch(`/api/units/${unitId}/publish`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setPublicUrl(data.publicUrl)
      setQrDataUrl(data.qrDataUrl)
      fetchUnits()
    }
  }

  const handleAddEvent = async (unitId: string, type: string) => {
    const content = prompt(`Enter ${type} content:`)
    if (!content) return

    await fetch(`/api/units/${unitId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content, visibility: 'public' }),
    })
    alert(`${type} added!`)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="mb-8">
          <MetricsCard />
        </div>

        {/* Create Unit Form */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Unit</h2>
          <form onSubmit={handleCreateUnit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Unit name"
                value={newUnit.name}
                onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>
            <div>
              <textarea
                placeholder="Description (optional)"
                value={newUnit.description}
                onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Unit'}
            </button>
          </form>
          {selectedUnitId && (
            <div className="mt-4 p-4 bg-green-50 rounded">
              <p className="font-semibold">Unit ID: {selectedUnitId}</p>
              <p className="text-sm text-gray-600">Copy this ID for reference</p>
            </div>
          )}
        </div>

        {/* Publish and Events */}
        {publicUrl && (
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Published!</h3>
            <p className="text-sm mb-2">
              <strong>Public URL:</strong>{' '}
              <a href={publicUrl} target="_blank" className="text-blue-600 underline">
                {publicUrl}
              </a>
            </p>
            {qrDataUrl && (
              <div className="mt-4">
                <Image src={qrDataUrl} alt="QR Code" width={256} height={256} className="border" />
              </div>
            )}
          </div>
        )}

        {/* Units List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Units</h2>
          {units.length === 0 ? (
            <p className="text-gray-500">No units yet. Create one above!</p>
          ) : (
            units.map((unit) => (
              <div key={unit.id} className="p-6 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{unit.name}</h3>
                    <p className="text-gray-600">{unit.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Status: <span className="font-semibold">{unit.status}</span>
                    </p>
                    <p className="text-xs text-gray-400">ID: {unit.id}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      unit.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {unit.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(unit.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Publish
                    </button>
                  )}
                  {unit.status === 'published' && (
                    <>
                      <button
                        onClick={() => handleAddEvent(unit.id, 'inquiry')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add Inquiry
                      </button>
                      <button
                        onClick={() => handleAddEvent(unit.id, 'tour')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        Add Tour
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
