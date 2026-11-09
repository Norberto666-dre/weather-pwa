const CACHE_NAME = "weatherpwa-v3";
const APP_SHELL = "/";
const OFFLINE_PAGE = "/offline.html";
const NAV_TIMEOUT = 4500;

const PRECACHE = [
  APP_SHELL,
  OFFLINE_PAGE,
  "/manifest.webmanifest",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png",
  "/assets/icons/icon-maskable-512x512.png",
  "/assets/emblema-128.png",
];

function offlineResponse() {
  return new Response(
    "Sin conexión. Vuelve a intentarlo cuando tengas internet.",
    {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    }
  );
}

function isCacheable(response) {
  return Boolean(
    response && (response.ok || response.type === "opaque")
  );
}

async function cachePut(request, response) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
  } catch {
    // Si el almacenamiento falla la app sigue funcionando en línea.
  }
}

async function fetchWithTimeout(request, timeout = NAV_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function findShell() {
  const cache = await caches.open(CACHE_NAME);

  return (
    (await cache.match(APP_SHELL)) ||
    (await cache.match(OFFLINE_PAGE)) ||
    null
  );
}

// Navegación: red primero con límite de espera; un 5xx o un timeout
// se resuelven con el shell guardado para que la app siga usable.
async function handleNavigation(request) {
  try {
    const response = await fetchWithTimeout(request);

    if (response && response.ok) {
      await cachePut(new Request(APP_SHELL), response.clone());
      return response;
    }

    const cached =
      (await caches.match(request)) || (await findShell());

    return cached || response;
  } catch {
    const cached =
      (await caches.match(request)) || (await findShell());

    return cached || offlineResponse();
  }
}

// Estáticos: caché primero, refresco en segundo plano.
async function handleStatic(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    fetch(request)
      .then((response) => {
        if (isCacheable(response)) cachePut(request, response.clone());
      })
      .catch(() => {});

    return cached;
  }

  try {
    const response = await fetch(request);

    if (isCacheable(response)) {
      cachePut(request, response.clone());
    }

    return response;
  } catch {
    return offlineResponse();
  }
}

// Iconos del clima remotos: caché primero para que el modo offline
// conserve la ilustración del último pronóstico.
async function handleRemoteImage(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) return cached;

  try {
    const response = await fetch(request);

    if (isCacheable(response)) {
      cachePut(request, response.clone());
    }

    return response;
  } catch {
    return offlineResponse();
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        PRECACHE.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) await cache.put(url, response.clone());
          } catch {
            // Si un recurso falla, la instalación continúa con el resto.
          }
        })
      );
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (
    url.hostname === "openweathermap.org" &&
    url.pathname.startsWith("/img/wn/")
  ) {
    event.respondWith(handleRemoteImage(request));
    return;
  }

  // Solo se controla el mismo origen; la API siempre va a la red.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/icon.png" ||
    url.pathname === "/apple-icon.png"
  ) {
    event.respondWith(handleStatic(request));
    return;
  }

  if (url.pathname === "/manifest.webmanifest") {
    event.respondWith(handleStatic(request));
  }
});
