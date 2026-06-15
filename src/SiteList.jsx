import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function SiteList({ onSelectSite }) {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSites() {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('name')

      if (error) setError(error.message)
      else setSites(data)
      setLoading(false)
    }

    fetchSites()
  }, [])

  if (loading) return (
    <p className="text-gray-400 text-sm">Loading sites...</p>
  )

  if (error) return (
    <p className="text-red-400 text-sm">{error}</p>
  )

  if (sites.length === 0) return (
    <p className="text-gray-400 text-sm">No sites assigned to your account.</p>
  )

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-medium mb-2">Your Sites</h2>
      {sites.map(site => (
        <button
          key={site.id}
          onClick={() => onSelectSite(site)}
          className="w-full text-left p-4 bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
        >
          <p className="font-medium">{site.name}</p>
          <p className="text-gray-400 text-sm mt-1">Tap to view cameras →</p>
        </button>
      ))}
    </div>
  )
}