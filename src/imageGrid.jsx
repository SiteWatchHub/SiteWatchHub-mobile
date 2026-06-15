import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function ImageGrid({ camera, onBack }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    async function fetchImages() {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('camera_id', camera.id)
        .order('captured_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        const withUrls = await Promise.all(data.map(async (image) => {
          // Full size for modal
          const { data: fullUrl } = await supabase.storage
            .from('images')
            .createSignedUrl(image.storage_path, 3600)

          // Thumbnail — resized to 400px via Supabase transform
          const { data: thumbUrl } = await supabase.storage
            .from('images')
            .createSignedUrl(image.storage_path, 3600, {
              transform: {
                width: 400,
                height: 400,
                resize: 'cover'
              }
            })

          return {
            ...image,
            url: fullUrl?.signedUrl,
            thumbnailUrl: thumbUrl?.signedUrl
          }
        }))
        setImages(withUrls)
      }
      setLoading(false)
    }

    fetchImages()
  }, [camera.id])

  function formatDate(ts) {
    return new Date(ts).toLocaleString('en-NZ', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        ← Back to cameras
      </button>

      <h2 className="text-lg font-medium mb-1">{camera.name}</h2>
      <p className="text-gray-400 text-sm mb-6">{images.length} images</p>

      {loading && <p className="text-gray-400 text-sm">Loading images...</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!loading && !error && images.length === 0 && (
        <p className="text-gray-400 text-sm">No images yet for this camera.</p>
      )}

      {/* Image grid */}
      <div className="grid grid-cols-2 gap-2">
        {images.map(image => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden hover:opacity-80 transition-opacity"
          >
            <img
              src={image.thumbnailUrl}
              alt={formatDate(image.captured_at)}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
              <p className="text-xs text-white">{formatDate(image.captured_at)}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Full image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <p className="text-gray-400 text-sm mb-4">{formatDate(selectedImage.captured_at)}</p>
          <img
            src={selectedImage.url}
            alt={formatDate(selectedImage.captured_at)}
            className="max-w-full max-h-full rounded-xl object-contain"
          />
          <p className="text-gray-500 text-xs mt-4">Tap anywhere to close</p>
        </div>
      )}
    </div>
  )
}
