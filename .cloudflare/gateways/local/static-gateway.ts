/**
 * Static Gateway - Obsługa plików statycznych z R2
 * Kompresja, cache, CDN optimization
 */

interface Env {
	STATIC_ASSETS: R2Bucket;
	CACHE: KVNamespace;
}

const CACHE_CONTROL_MAP: Record<string, string> = {
	// Długi cache dla assetów z hashami
	'.js': 'public, max-age=31536000, immutable',
	'.css': 'public, max-age=31536000, immutable',
	'.woff2': 'public, max-age=31536000, immutable',
	'.woff': 'public, max-age=31536000, immutable',

	// Średni cache dla obrazów
	'.jpg': 'public, max-age=604800',
	'.jpeg': 'public, max-age=604800',
	'.png': 'public, max-age=604800',
	'.webp': 'public, max-age=604800',
	'.svg': 'public, max-age=604800',

	// Krótki cache dla HTML
	'.html': 'public, max-age=3600, must-revalidate',

	// Brak cache dla API
	'.json': 'no-cache, no-store, must-revalidate'
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		let pathname = url.pathname;

		// Obsługa CORS
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
					'Access-Control-Allow-Headers': 'Range, If-None-Match',
				}
			});
		}

		// Normalizacja ścieżki
		if (pathname === '/' || pathname === '') {
			pathname = '/index.html';
		}

		// Usunięcie leading slash dla R2
		const key = pathname.startsWith('/') ? pathname.slice(1) : pathname;

		try {
			// Sprawdzenie Cloudflare Cache
			const cache = caches.default;
			let response = await cache.match(request);

			if (response) {
				return addSecurityHeaders(response);
			}

			// Pobranie z R2
			const object = await env.STATIC_ASSETS.get(key);

			if (!object) {
				return new Response('Nie znaleziono pliku', { status: 404 });
			}

			// ETag dla conditional requests
			const etag = object.httpEtag;
			if (request.headers.get('If-None-Match') === etag) {
				return new Response(null, { status: 304 });
			}

			// Określenie typu zawartości
			const ext = pathname.substring(pathname.lastIndexOf('.'));
			const contentType = getContentType(ext);
			const cacheControl = CACHE_CONTROL_MAP[ext] || 'public, max-age=3600';

			// Headers
			const headers = new Headers();
			headers.set('Content-Type', contentType);
			headers.set('Cache-Control', cacheControl);
			headers.set('ETag', etag);
			headers.set('Access-Control-Allow-Origin', '*');

			// Kompresja
			const acceptEncoding = request.headers.get('Accept-Encoding') || '';
			if (acceptEncoding.includes('br') && shouldCompress(ext)) {
				headers.set('Content-Encoding', 'br');
			} else if (acceptEncoding.includes('gzip') && shouldCompress(ext)) {
				headers.set('Content-Encoding', 'gzip');
			}

			response = new Response(object.body, { headers });

			// Cache w Cloudflare CDN
			if (shouldCacheInCDN(ext)) {
				ctx.waitUntil(cache.put(request, response.clone()));
			}

			return addSecurityHeaders(response);

		} catch (error) {
			return new Response('Błąd serwera', { status: 500 });
		}
	}
};

function getContentType(ext: string): string {
	const types: Record<string, string> = {
		'.html': 'text/html; charset=utf-8',
		'.css': 'text/css; charset=utf-8',
		'.js': 'application/javascript; charset=utf-8',
		'.json': 'application/json; charset=utf-8',
		'.png': 'image/png',
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.webp': 'image/webp',
		'.svg': 'image/svg+xml',
		'.woff': 'font/woff',
		'.woff2': 'font/woff2',
		'.ico': 'image/x-icon',
		'.pdf': 'application/pdf',
	};
	return types[ext] || 'application/octet-stream';
}

function shouldCompress(ext: string): boolean {
	return ['.html', '.css', '.js', '.json', '.svg'].includes(ext);
}

function shouldCacheInCDN(ext: string): boolean {
	// Wszystko poza API responses
	return ext !== '.json' || !ext.includes('api');
}

function addSecurityHeaders(response: Response): Response {
	const headers = new Headers(response.headers);
	headers.set('X-Content-Type-Options', 'nosniff');
	headers.set('X-Frame-Options', 'SAMEORIGIN');
	headers.set('X-XSS-Protection', '1; mode=block');
	headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
