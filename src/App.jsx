import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import SiteList from './SiteList'
import CameraList from './CameraList'
import ImageGrid from './ImageGrid'

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [selectedCamera, setSelectedCamera] = useState(null)

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
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

  if (session) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold">SiteWatchHub</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
          <p className="text-gray-400">Logged in as {session.user.email}</p>
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
          </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="w-full max-w-sm p-8 bg-gray-900 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-semibold mb-1">SiteWatchHub</h1>
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
            className="px-4 py-3 bg-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
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