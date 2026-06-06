const CACHE_NAME = "icams-v1"
const OFFLINE_URL = "/offline"
const PRECACHE_URLS = [
  "/",
  "/login",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon.ico",
  "/pwa/icon-192",
  "/pwa/icon-512",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }

          return Promise.resolve(false)
        })
      )
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event

  if (request.method !== "GET") {
    return
  }

  const url = new URL(request.url)

  if (url.origin !== self.location.origin) {
    return
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          )
          return response
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request)
          if (cachedResponse) {
            return cachedResponse
          }

          return caches.match(OFFLINE_URL)
        })
    )
    return
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/favicon.ico" ||
    url.pathname.startsWith("/pwa/")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          event.waitUntil(
            fetch(request)
              .then((response) =>
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, response.clone())
                })
              )
              .catch(() => undefined)
          )
          return cachedResponse
        }

        return fetch(request).then((response) => {
          const copy = response.clone()
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          )
          return response
        })
      })
    )
  }
})
