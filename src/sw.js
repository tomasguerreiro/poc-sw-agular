const CACHE_NAME = "my-cache-v1";

// URL do host
const hostUrl = new URL(self.location.origin);

// Extensões permitidas
const allowedExtensions = [".js", ".css", ".html", ".png", ".jpg", ".jpeg", ".gif", ".svg"];

// URLs para precaching
const urlsToCache = new Set([hostUrl.href]);

self.addEventListener("install", (event) => {
	// Precaching dinâmico: busca o index.html e extrai os nomes dos bundles usando regex
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return fetch(hostUrl.pathname) // Caminho para o seu arquivo principal
				.then((response) => {
					return response.text();
				})
				.then((body) => {
					// Expressão regular para encontrar tags <script> com atributo src  e <link> com atributo href
					const pattern = /<(?:script|link)\s[^>]*?(?:src|href)\s*=\s*["']([^"']+)["']/g;
					const matches = body.matchAll(pattern);

					for (const match of matches) {
						const url = new URL(match[1], self.location.origin);
						// Verifica se a URL termina com uma das extensões permitidas
						if (allowedExtensions.some((ext) => url.pathname.endsWith(ext))) {
							urlsToCache.add(url.href);
						}
					}

					console.log("Precaching:", [...urlsToCache]);

					return cache.addAll([...urlsToCache]);
				});
		}),
	);
});

// Intercepta a solicitação e responde com um recurso do cache ou da rede
self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);

	// Verifica se a URL termina com uma das extensões permitidas
	if (allowedExtensions.some((ext) => url.pathname.endsWith(ext))) {
		urlsToCache.add(url.href);
	}

	// Se não for uma url permitida, retorna a requisição (urlsToCache)
	if (!urlsToCache.has(url.href)) {
		return event.respondWith(fetch(event.request));
	}

	// Se a url for permitida mas a resposta for 404, remove a url do cache,
	// mas usa a estratégia Estratégia Stale While Revalidate.
	event.respondWith(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.match(event.request).then((cachedResponse) => {
				const fetchPromise = fetch(event.request).then((networkResponse) => {
					if (!networkResponse.ok && networkResponse.status !== 0) {
						console.log("Delete cache:", event.request.url);
						cache.delete(event.request);
					} else if (networkResponse.ok) {
						cache.put(event.request, networkResponse.clone());
					}

					return networkResponse;
				});
				return cachedResponse || fetchPromise;
			});
		}),
	);
});

self.addEventListener("activate", (event) => {
	//remove o cache que não esta em urlsToCache
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.keys().then((keys) => {
				return Promise.all(
					keys.map((request) => {
						if (!urlsToCache.has(request.url)) {
							console.log("Delete cache:", request.url);
							return cache.delete(request);
						}
					}),
				);
			});
		}),
	);
});
