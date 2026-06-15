import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import SiteList from './SiteList'
import CameraList from './CameraList'
import ImageGrid from './ImageGrid'
import Settings from './Settings'
import NotificationImage from './NotificationImage'

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [notificationImageId, setNotificationImageId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Handle notification taps
  useEffect(() => {
    // App opened fresh from a notification tap
    const params = new URLSearchParams(window.location.search)
    const imageId = params.get('image')
    if (imageId) setNotificationImageId(imageId)

    // App already open when notification is tapped
    const handleMessage = (event) => {
      if (event.data?.type === 'NAVIGATE') {
        const params = new URLSearchParams(event.data.url.split('?')[1])
        const imageId = params.get('image')
        if (imageId) setNotificationImageId(imageId)
      }
    }
    navigator.serviceWorker?.addEventListener('message', handleMessage)
    return () => navigator.serviceWorker?.removeEventListener('message', handleMessage)
  }, [])

  async function handleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  function goHome() {
    setSelectedSite(null)
    setSelectedCamera(null)
  }

  // ─── Login screen ───────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="w-full max-w-sm p-8 bg-gray-900 rounded-2xl shadow-xl">

          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-500 text-xl">⬡</span>
            <h1 className="text-2xl font-semibold">SiteWatchHub</h1>
          </div>
          <p className="text-gray-400 text-sm mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="px-4 py-3 bg-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="px-4 py-3 bg-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className="py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

        </div>
      </div>
    )
  }

  // ─── Authenticated layout ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <button
            onClick={goHome}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-blue-500 text-xl">⬡</span>
            <span className="text-lg font-semibold">SiteWatchHub</span>
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(true)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      {selectedSite && (
        <div className="px-6 py-3 border-b border-gray-800/50">
          <div className="max-w-lg mx-auto flex items-center gap-2 text-sm text-gray-400">
            <button onClick={goHome} className="hover:text-white transition-colors">
              Sites
            </button>
            {selectedSite && (
              <>
                <span>›</span>
                <button
                  onClick={() => setSelectedCamera(null)}
                  className="hover:text-white transition-colors"
                >
                  {selectedSite.name}
                </button>
              </>
            )}
            {selectedCamera && (
              <>
                <span>›</span>
                <span className="text-white">{selectedCamera.name}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-lg mx-auto px-6 py-8">
        {!selectedSite && (
          <SiteList onSelectSite={site => setSelectedSite(site)} />
        )}

        {selectedSite && !selectedCamera && (
          <CameraList
            site={selectedSite}
            onSelectCamera={camera => setSelectedCamera(camera)}
            onBack={() => setSelectedSite(null)}
          />
        )}

        {selectedSite && selectedCamera && (
          <ImageGrid
            camera={selectedCamera}
            onBack={() => setSelectedCamera(null)}
          />
        )}
      </main>

      {/* Notification image modal */}
      {notificationImageId && (
        <NotificationImage
          imageId={notificationImageId}
          onClose={() => {
            setNotificationImageId(null)
            window.history.replaceState({}, '', '/')
          }}
        />
      )}

      {/* Settings sheet */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

    </div>
  )
}