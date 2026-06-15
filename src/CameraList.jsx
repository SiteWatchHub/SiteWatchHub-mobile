import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function CameraList({ site, onSelectCamera, onBack }) {
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCameras() {
      const { data, error } = await supabase
        .from('cameras')
        .select('*')
        .eq('site_id', site.id)
        .order('name')

      if (error) setError(error.message)
      else setCameras(data)
      setLoading(false)
    }

    fetchCameras()
  }, [site.id])

  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        ← Back to sites
      </button>

      <h2 className="text-lg font-medium mb-2">{site.name}</h2>
      <p className="text-gray-400 text-sm mb-6">Select a camera to view images</p>

      {loading && <p className="text-gray-400 text-sm">Loading cameras...</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!loading && !error && cameras.length === 0 && (
        <p className="text-gray-400 text-sm">No cameras found at this site.</p>
      )}

      <div className="flex flex-col gap-3">
        {cameras.map(camera => (
          <button
            key={camera.id}
            onClick={() => onSelectCamera(camera)}
            className="w-full text-left p-4 bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
          >
            <p className="font-medium">{camera.name}</p>
            <p className="text-gray-400 text-sm mt-1">Tap to view images →</p>
          </button>
        ))}
      </div>
    </div>
  )
}