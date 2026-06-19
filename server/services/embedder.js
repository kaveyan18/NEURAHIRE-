// server/services/embedder.js
// Singleton wrapper — model loads once, reused for every request.
// Uses dynamic import() because @huggingface/transformers is ESM-only.

let _embedder = null;
let _loadPromise = null;
let _loadFailed = false;

async function getEmbedder() {
  if (_loadFailed) return null;          // already failed once, skip retry
  if (_embedder) return _embedder;
  if (_loadPromise) return _loadPromise; // concurrent requests share one load

  _loadPromise = (async () => {
    try {
      console.log('[Embedder] Loading all-MiniLM-L6-v2...');
      const t0 = Date.now();
      const { pipeline, env } = await import('@huggingface/transformers');
      env.allowLocalModels = false;
      env.useBrowserCache = false;
      _embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log(`[Embedder] Ready in ${Date.now() - t0}ms`);
      return _embedder;
    } catch (err) {
      console.error('[Embedder] Failed to load — falling back to TF-IDF only:', err.message);
      _loadFailed = true;
      return null;
    }
  })();

  return _loadPromise;
}

async function embed(texts) {
  const embedder = await getEmbedder();
  if (!embedder) return null; // signal caller to fall back

  const MAX_BATCH = 300;
  if (texts.length > MAX_BATCH) texts = texts.slice(0, MAX_BATCH);

  const output = await embedder(texts, { pooling: 'mean', normalize: true });
  return output.tolist();
}

function isEmbedderReady() {
  return _embedder !== null;
}

function embedderFailed() {
  return _loadFailed;
}

module.exports = { getEmbedder, embed, isEmbedderReady, embedderFailed };