import type { APIRoute } from 'astro';

export const prerender = false;

const CORS_HEADERS = {
	'Content-Type': 'application/json',
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

// Simple in-memory cache: username → { data, expiresAt }
interface CacheEntry {
	data: unknown;
	expiresAt: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Periodically evict expired entries to prevent unbounded memory growth
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of cache) {
		if (now >= entry.expiresAt) {
			cache.delete(key);
		}
	}
}, CACHE_TTL_MS);

function isValidUsername(username: string): boolean {
	// GitHub usernames: 1–39 chars, alphanumeric or hyphens, cannot start/end with hyphen
	return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username);
}

export const GET: APIRoute = async ({ params }) => {
	const { username } = params;

	if (!username) {
		return new Response(JSON.stringify({ error: 'Username is required' }), {
			status: 400,
			headers: CORS_HEADERS,
		});
	}

	if (!isValidUsername(username)) {
		return new Response(JSON.stringify({ error: 'Invalid GitHub username' }), {
			status: 400,
			headers: CORS_HEADERS,
		});
	}

	// Return cached result if still fresh
	const cached = cache.get(username);
	if (cached && Date.now() < cached.expiresAt) {
		return new Response(JSON.stringify(cached.data), {
			status: 200,
			headers: { ...CORS_HEADERS, 'X-Cache': 'HIT' },
		});
	}

	const url = `https://github.com/${encodeURIComponent(username)}.contribs`;

	let response: Response;
	try {
		response = await fetch(url, {
			headers: { Accept: 'application/json' },
		});
	} catch (err) {
		return new Response(
			JSON.stringify({ error: 'Failed to reach GitHub', details: String(err) }),
			{ status: 502, headers: CORS_HEADERS },
		);
	}

	if (response.status === 404) {
		return new Response(JSON.stringify({ error: 'GitHub user not found' }), {
			status: 404,
			headers: CORS_HEADERS,
		});
	}

	if (!response.ok) {
		return new Response(
			JSON.stringify({ error: 'GitHub API error', status: response.status }),
			{ status: 502, headers: CORS_HEADERS },
		);
	}

	let data: unknown;
	try {
		data = await response.json();
	} catch {
		return new Response(
			JSON.stringify({ error: 'Invalid JSON response from GitHub' }),
			{ status: 502, headers: CORS_HEADERS },
		);
	}

	// Store in cache
	cache.set(username, { data, expiresAt: Date.now() + CACHE_TTL_MS });

	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { ...CORS_HEADERS, 'X-Cache': 'MISS' },
	});
};
