const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export async function registerNotifications(supabase) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported')
    return false
  }

  // Register service worker
  const registration = await navigator.serviceWorker.register('/sw.js')

  // Request permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    console.warn('Notification permission denied')
    return false
  }

  // Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  })

  // Save subscription to Supabase
  const { error } = await supabase
    .from('devices')
    .upsert({
      user_id: (await supabase.auth.getUser()).data.user.id,
      subscription: JSON.stringify(subscription),
      enabled: true
    }, { onConflict: 'user_id' })

  if (error) {
    console.error('Failed to save subscription:', error)
    return false
  }

  console.log('Push notifications registered!')
  return true
}

export async function unregisterNotifications(supabase) {
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return

  const subscription = await registration.pushManager.getSubscription()
  if (subscription) await subscription.unsubscribe()

  await supabase
    .from('devices')
    .update({ enabled: false })
    .eq('user_id', (await supabase.auth.getUser()).data.user.id)
}