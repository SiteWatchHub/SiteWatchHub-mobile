const VAPID_PUBLIC_KEY = 'BIB5z8Zl39UExDr3W_0P-28Y3EK-6JfqLlAyivxcUd-mmCS26d_IoBdMWZBzMcIK1A-n9zSfELmQUgK0OkcxLSA'

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

  const registration = await navigator.serviceWorker.register('/sw.js')

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    console.warn('Notification permission denied')
    return false
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  })

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
