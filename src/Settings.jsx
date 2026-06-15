import { useState, useEffect } from 'react'
import { registerNotifications, unregisterNotifications } from './useNotifications'
import { supabase } from './supabase'

export default function Settings({ onClose }) {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkStatus() {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return
      const subscription = await registration.pushManager.getSubscription()
      setEnabled(!!subscription)
    }
    checkStatus()
  }, [])

  async function toggle() {
    setLoading(true)
    if (enabled) {
      await unregisterNotifications(supabase)
      setEnabled(false)
    } else {
      const success = await registerNotifications(supabase)
      setEnabled(success)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end z-50" onClick={onClose}>
      <div
        className="w-full bg-gray-900 rounded-t-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-6">Settings</h2>

        <div className="flex items-center justify-between py-4 border-b border-gray-800">
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-gray-400 text-sm mt-1">Get notified when new images are captured</p>
          </div>
          <button
            onClick={toggle}
            disabled={loading}
            className={`w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full mx-auto transition-transform ${enabled ? 'translate-x-3' : '-translate-x-3'}`} />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}