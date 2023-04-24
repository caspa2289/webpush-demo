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
            icon: './image.jpg',
            image: './image2.jpg',
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

            return self.clients.openWindow('https://caspa2289.github.io/webpush-demo/')
        })
    )
})

self.addEventListener('fetch', (event) => {
    //МОК ИЗ ДОКИ, ничего осмысленного не делает
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {

                return response;
            }

            return fetch(event.request)
                .then((response) => {
                    return response;
                })
                .catch((error) => {
                    throw error;
                });
        })
    );
})
