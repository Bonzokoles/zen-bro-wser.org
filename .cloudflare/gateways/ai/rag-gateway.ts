/**
 * RAG Gateway - Retrieval Augmented Generation
 * Vector search, document indexing, semantic search
 */

interface Env {
	VECTORIZE: VectorizeIndex;
	CACHE: KVNamespace;
	DB: D1Database;
	OPENROUTER_API_KEY: string;
}

interface SearchQuery {
	query: string;
	topK?: number;
	filter?: Record<string, any>;
	returnMetadata?: boolean;
}

interface Document {
	id: string;
	content: string;
	metadata?: Record<string, any>;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			if (url.pathname === '/rag/search') {
				return handleSearch(request, env, corsHeaders);
			}

			if (url.pathname === '/rag/index') {
				return handleIndex(request, env, ctx, corsHeaders);
			}

			if (url.pathname === '/rag/query') {
				return handleRAGQuery(request, env, corsHeaders);
			}

			if (url.pathname === '/rag/stats') {
				return handleStats(env, corsHeaders);
			}

			return jsonResponse({
				success: false,
				error: 'Nieznany endpoint RAG'
			}, 404, corsHeaders);

		} catch (error) {
			return jsonResponse({
				success: false,
				error: error instanceof Error ? error.message : 'Błąd serwera'
			}, 500, corsHeaders);
		}
	}
};

async function handleSearch(
	request: Request,
	env: Env,
	corsHeaders: Record<string, string>
): Promise<Response> {
	const body = await request.json() as SearchQuery;

	if (!body.query) {
		return jsonResponse({
			success: false,
			error: 'Brak zapytania'
		}, 400, corsHeaders);
	}

	// Generate embedding for query
	const embedding = await generateEmbedding(body.query, env);

	// Vector search
	const results = await env.VECTORIZE.query(embedding, {
		topK: body.topK || 5,
		filter: body.filter,
		returnMetadata: body.returnMetadata !== false
	});

	// Enhance results with full content from D1
	const enhancedResults = await Promise.all(
		results.matches.map(async (match) => {
			const doc = await env.DB.prepare(
				'SELECT * FROM documents WHERE id = ?'
			).bind(match.id).first();

			return {
				...match,
				content: doc?.content,
				metadata: doc?.metadata
			};
		})
	);

	return jsonResponse({
		success: true,
		data: {
			query: body.query,
			results: enhancedResults
		}
	}, 200, corsHeaders);
}

async function handleIndex(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
	corsHeaders: Record<string, string>
): Promise<Response> {
	const body = await request.json() as Document | Document[];
	const documents = Array.isArray(body) ? body : [body];

	if (documents.length === 0) {
		return jsonResponse({
			success: false,
			error: 'Brak dokumentów do zaindeksowania'
		}, 400, corsHeaders);
	}

	const indexed: string[] = [];
	const errors: string[] = [];

	for (const doc of documents) {
		try {
			// Generate embedding
			const embedding = await generateEmbedding(doc.content, env);

			// Store in Vectorize
			await env.VECTORIZE.insert([{
				id: doc.id,
				values: embedding,
				metadata: doc.metadata
			}]);

			// Store full content in D1
			await env.DB.prepare(
				'INSERT OR REPLACE INTO documents (id, content, metadata, indexed_at) VALUES (?, ?, ?, ?)'
			).bind(
				doc.id,
				doc.content,
				JSON.stringify(doc.metadata || {}),
				new Date().toISOString()
			).run();

			indexed.push(doc.id);
		} catch (error) {
			errors.push(`${doc.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	return jsonResponse({
		success: indexed.length > 0,
		data: {
			indexed: indexed.length,
			errors: errors.length,
			details: {
				indexed,
				errors
			}
		}
	}, 200, corsHeaders);
}

async function handleRAGQuery(
	request: Request,
	env: Env,
	corsHeaders: Record<string, string>
): Promise<Response> {
	const body = await request.json() as { question: string; context?: string };

	if (!body.question) {
		return jsonResponse({
			success: false,
			error: 'Brak pytania'
		}, 400, corsHeaders);
	}

	// 1. Vector search dla kontekstu
	const embedding = await generateEmbedding(body.question, env);
	const searchResults = await env.VECTORIZE.query(embedding, {
		topK: 3,
		returnMetadata: true
	});

	// 2. Retrieve full documents
	const context = await Promise.all(
		searchResults.matches.map(async (match) => {
			const doc = await env.DB.prepare(
				'SELECT content FROM documents WHERE id = ?'
			).bind(match.id).first();
			return doc?.content || '';
		})
	);

	// 3. Generate answer with LLM
	const prompt = `Kontekst z bazy wiedzy:
${context.join('\n\n')}

${body.context ? `Dodatkowy kontekst: ${body.context}\n\n` : ''}
Pytanie: ${body.question}

Odpowiedz na podstawie dostarczonego kontekstu. Jeśli kontekst nie zawiera odpowiedzi, powiedz to wprost.`;

	const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'deepseek/deepseek-r1',
			messages: [
				{ role: 'system', content: 'Jesteś pomocnym asystentem odpowiadającym na pytania na podstawie dostarczonego kontekstu.' },
				{ role: 'user', content: prompt }
			],
			temperature: 0.5,
			max_tokens: 1500
		})
	});

	if (!response.ok) {
		return jsonResponse({
			success: false,
			error: 'Błąd generowania odpowiedzi'
		}, response.status, corsHeaders);
	}

	const data = await response.json();

	return jsonResponse({
		success: true,
		data: {
			question: body.question,
			answer: data.choices[0].message.content,
			sources: searchResults.matches.map(m => m.id),
			context: context
		}
	}, 200, corsHeaders);
}

async function handleStats(env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const stats = await env.DB.prepare(
		`SELECT
			COUNT(*) as total_documents,
			COUNT(DISTINCT json_extract(metadata, '$.type')) as document_types,
			MAX(indexed_at) as last_indexed
		FROM documents`
	).first();

	return jsonResponse({
		success: true,
		data: stats
	}, 200, corsHeaders);
}

async function generateEmbedding(text: string, env: Env): Promise<number[]> {
	// W produkcji: integracja z OpenAI embeddings, Cohere, lub local model
	// Placeholder: zwraca losowy wektor (768 wymiarów)
	// TODO: Implementacja prawdziwych embeddings

	// Tymczasowa implementacja - hash text do deterministycznego wektora
	const hash = simpleHash(text);
	const vector = new Array(768).fill(0).map((_, i) => {
		return Math.sin(hash + i) * 0.5;
	});

	return vector;
}

function simpleHash(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	return hash;
}

function jsonResponse(data: any, status = 200, additionalHeaders: Record<string, string> = {}): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...additionalHeaders
		}
	});
}
