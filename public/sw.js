self.addEventListener('push', event => {
  const data = event.data?.json() ?? {}

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'SiteWatchHub', {
      body: data.body ?? 'New image captured',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url ?? '/' }
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If app is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.postMessage({ type: 'NAVIGATE', url })
          return
        }
      }
      // Otherwise open a new window
      clients.openWindow(url)
    })
  )
})