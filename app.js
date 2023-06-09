const button = document.getElementById('button')
const notificationPermissionIndicator = document.getElementById('notificationPermission')
const publicKeyIndicator = document.getElementById('publicKey')
const subscriptionIndicator = document.getElementById('subscription')
const permissionButton = document.getElementById('permissionButton')

console.log('test')

const getServerPublicKey = async () => {
    const response = await fetch('https://rocketbackend.up.railway.app/api/v1/notification/publicKey', {
        headers: { 'Content-type': 'application/json' }
    })

    return await response.json()
}

const registerListener = async ( endpoint, key, authSecret) => {
    await fetch('https://rocketbackend.up.railway.app/api/v1/notification/register', {
        method: 'post',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ endpoint, key, authSecret })
    })

    button.disabled = false
}

const unregisterListener = async (endpoint) => {
    await fetch('https://rocketbackend.up.railway.app/api/v1/notification/unregister', {
        method: 'post',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ endpoint })
    })

    button.disabled = true
    subscriptionIndicator.style.color = 'red'
}

const subscribe = async (applicationServerKey) => {
    if (navigator?.serviceWorker) {
        const registration = await navigator.serviceWorker.register('./serviceWorker.js')

        await navigator.serviceWorker.ready

        const subscription = await registration.pushManager.subscribe({
            applicationServerKey,
            userVisibleOnly: true
        })

        const key = btoa(
            String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey('p256dh'))
            )
        )

        const authSecret = btoa(
            String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey('auth'))
            )
        )

        const { endpoint } = subscription

        await registerListener(endpoint, key, authSecret)
    }
}

const setup = async () => {
    try {

        const addListeners = async () => {
            button.addEventListener('click', unregisterListener)

            const { response: { publicKey } } = await getServerPublicKey()
            publicKeyIndicator.style.color = 'green'

            await subscribe(publicKey)
            subscriptionIndicator.style.color = 'green'
        }

        alert(navigator.userAgent)

        const isIos = !!navigator.userAgent.match(/(IPhone)/gi)

        if (!isIos) {
            const permission = await Notification.requestPermission()

            if (permission !== 'granted') {
                throw new Error('Notification permission required')
            } else {
                notificationPermissionIndicator.style.color = 'green'
            }

            addListeners()
        } else {
            // const isAppInstalled = window.matchMedia('display: standalone').matches
            // alert(`Is app installed: ${isAppInstalled}`)

            // if (isAppInstalled) {
                permissionButton.disabled = false

                permissionButton.addEventListener('click', () => {
                    addListeners()
                })
            // }
        }

    } catch (err) {
        alert(err)
    }
}

setup().then(() => {
    console.log('Success!')
})
