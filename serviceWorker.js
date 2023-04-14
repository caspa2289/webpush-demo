self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
    const { title, body } = event.data.json()

    event.waitUntil(
        self.registration.showNotification(title, {
            //Всё это можно отправлять с бэка
            body,
            icon: 'image.jpg',
            image: 'image2.jpg',
            vibrate: [500, 100, 500],
            requireInteraction: true
        })
    )
})

self.addEventListener('notificationclick', (event) => {
    event.waitUntil(
        self.clients.matchAll().then((clientList) => {
            if (clientList.length > 0) {
                return clientList[0].focus()
            }

            return self.clients.openWindow('http://localhost:63342')
        })
    )
})
