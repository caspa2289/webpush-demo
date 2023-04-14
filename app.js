const button = document.getElementById('button')
const notificationPermissionIndicator = document.getElementById('notificationPermission')
const publicKeyIndicator = document.getElementById('publicKey')
const subscriptionIndicator = document.getElementById('subscription')

const getServerPublicKey = async () => {
    const response = await fetch('http://localhost:6969/api/v1/notification/publicKey', {
        headers: { 'Content-type': 'application/json' }
    })

    return await response.json()
}

const registerListener = async ( endpoint, key, authSecret ) => {
    await fetch('http://localhost:6969/api/v1/notification/register', {
        method: 'post',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ endpoint, key, authSecret })
    })

    button.disabled = false
}

const unregisterListener = async ( endpoint ) => {
    await fetch('http://localhost:6969/api/v1/notification/unregister', {
        method: 'post',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ endpoint })
    })

    button.disabled = true
    subscriptionIndicator.style.color = 'red'
}

const subscribe = async ( applicationServerKey ) => {
    if (navigator?.serviceWorker) {
        const registration = await navigator.serviceWorker.register('serviceWorker.js')

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
        button.addEventListener('click', unregisterListener)

        const permission = await Notification.requestPermission()

        if (permission !== 'granted') {
            throw new Error('Notification permission required')
        } else {
            notificationPermissionIndicator.style.color = 'green'
        }

        const { response: { publicKey } } = await getServerPublicKey()
        publicKeyIndicator.style.color = 'green'

        await subscribe(publicKey)
        subscriptionIndicator.style.color = 'green'


    } catch (err) {
        alert(err)
    }

}

setup().then(() => {
    console.log('Success!')
})
