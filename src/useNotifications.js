const VAPID_PUBLIC_KEY = 'BIB5z8Zl39UExDr3W_0P-28Y3EK-6JfqLlAyivxcUd-mmCS26d_IoBdMWZBzMcIK1A-n9zSfELmQUgK0OkcxLSA'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export async function registerNotifications(supabase) {
  console.log('1. starting registration')
  console.log('VAPID key:', VAPID_PUBLIC_KEY)

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported')
    return false
  }
  console.log('2. push supported')

  const registration = await navigator.serviceWorker.register('/sw.js')
  console.log('3. service worker registered:', registration)

  const permission = await Notification.requestPermission()
  console.log('4. permission:', permission)
  if (permission !== 'granted') return false

  console.log('5. subscribing to push...')
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  })
  console.log('6. subscribed:', subscription)
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
