import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function NotificationImage({ imageId, onClose }) {
  const [image, setImage] = useState(null)
  const [url, setUrl] = useState(null)

  useEffect(() => {
    async function fetchImage() {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('id', imageId)
        .single()

      if (error || !data) return

      const { data: urlData } = await supabase.storage
        .from('images')
        .createSignedUrl(data.storage_path, 3600)

      setImage(data)
      setUrl(urlData?.signedUrl)
    }
    fetchImage()
  }, [imageId])

  if (!image || !url) return null

  function formatDate(ts) {
    return new Date(ts).toLocaleString('en-NZ', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <p className="text-gray-400 text-sm mb-4">{formatDate(image.captured_at)}</p>
      <img
        src={url}
        alt={formatDate(image.captured_at)}
        className="max-w-full max-h-full rounded-xl object-contain"
      />
      <p className="text-gray-500 text-xs mt-4">Tap anywhere to close</p>
    </div>
  )
}