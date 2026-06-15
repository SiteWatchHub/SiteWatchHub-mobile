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
      if (clientList.length > 0) {
        // App is open — navigate it to the new URL
        const client = clientList[0]
        client.navigate(url)
        client.focus()
      } else {
        // App is closed — open it
        clients.openWindow(url)
      }
    })
  )
})