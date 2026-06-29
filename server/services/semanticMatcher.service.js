// server/services/semanticMatcher.service.js
// Computes embedding-based similarity between resume skills and JD skills.
// Gracefully degrades to canonical/alias-only matching when the embedder is unavailable.

'use strict';

const { embed, isEmbedderReady } = require('./embedder');
const { normalizeSkillToken } = require('./normalizer.service');

const DEFAULT_THRESHOLD = 0.80;

/**
 * @typedef {Object} SemanticMatch
 * @property {string} jdSkill      - canonical JD skill
 * @property {string} resumeSkill  - canonical resume skill that matched
 * @property {number} similarity   - cosine similarity score [0, 1]
 * @property {string} matchType    - 'exact' | 'alias' | 'semantic'
 */

/**
 * @typedef {Object} MatchResult
 * @property {string[]}        directMatches    - JD skills matched exactly/by alias in resume
 * @property {SemanticMatch[]} semanticMatches  - JD skills matched semantically
 * @property {string[]}        missing          - JD skills with no match at all
 */

/**
 * Match JD skills against resume skills using direct canonical matching first,
 * then semantic cosine similarity for unmatched skills.
 *
 * @param {import('./skillExtractor.service').ExtractedSkill[]} resumeSkills
 * @param {import('./skillExtractor.service').ExtractedSkill[]} jdSkills
 * @param {number} [threshold=0.80]
 * @returns {Promise<MatchResult>}
 */
async function semanticMatch(resumeSkills, jdSkills, threshold = DEFAULT_THRESHOLD) {
  if (!jdSkills.length) {
    return { directMatches: [], semanticMatches: [], missing: [] };
  }

  // Build a normalized set of resume skill canonicals for fast lookup
  const resumeCanonicals = new Set(
    resumeSkills.map(s => normalizeSkillToken(s.canonical))
  );

  const directMatches = [];
  const unmatched = [];  // JD skills that need semantic check

  for (const jdSkill of jdSkills) {
    const jdKey = normalizeSkillToken(jdSkill.canonical);
    if (resumeCanonicals.has(jdKey)) {
      directMatches.push(jdSkill.canonical);
    } else {
      unmatched.push(jdSkill);
    }
  }

  // If nothing to do semantically, return early
  if (unmatched.length === 0) {
    return { directMatches, semanticMatches: [], missing: [] };
  }

  // Attempt semantic matching
  const semanticMatches = [];
  const missing = [];

  if (isEmbedderReady()) {
    try {
      const { recoveredMatches, stillMissing } = await _computeSemanticMatches(
        resumeSkills,
        unmatched,
        threshold
      );
      semanticMatches.push(...recoveredMatches);
      missing.push(...stillMissing.map(s => s.canonical));
    } catch (err) {
      console.warn('[SemanticMatcher] Embedding failed, marking unmatched as missing:', err.message);
      missing.push(...unmatched.map(s => s.canonical));
    }
  } else {
    // Embedder not ready — all unmatched are missing
    missing.push(...unmatched.map(s => s.canonical));
  }

  return { directMatches, semanticMatches, missing };
}

// ─── Internal embedding logic ─────────────────────────────────────────────────

async function _computeSemanticMatches(resumeSkills, unmatchedJdSkills, threshold) {
  const jdTexts     = unmatchedJdSkills.map(s => s.canonical);
  const resumeTexts = resumeSkills.map(s => s.canonical);

  const allTexts = [...jdTexts, ...resumeTexts];
  const vectors  = await embed(allTexts);

  if (!vectors) {
    return {
      recoveredMatches: [],
      stillMissing: unmatchedJdSkills,
    };
  }

  const jdVecs     = vectors.slice(0, jdTexts.length);
  const resumeVecs = vectors.slice(jdTexts.length);

  const recoveredMatches = [];
  const stillMissing     = [];

  for (let i = 0; i < unmatchedJdSkills.length; i++) {
    let bestSim   = 0;
    let bestSkill = null;

    for (let j = 0; j < resumeSkills.length; j++) {
      const sim = _cosine(jdVecs[i], resumeVecs[j]);
      if (sim > bestSim) {
        bestSim   = sim;
        bestSkill = resumeSkills[j];
      }
    }

    if (bestSim >= threshold && bestSkill) {
      recoveredMatches.push({
        jdSkill:     unmatchedJdSkills[i].canonical,
        resumeSkill: bestSkill.canonical,
        similarity:  Math.round(bestSim * 1000) / 1000,
        matchType:   'semantic',
      });
    } else {
      stillMissing.push(unmatchedJdSkills[i]);
    }
  }

  return { recoveredMatches, stillMissing };
}

function _cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

module.exports = {
  semanticMatch,
  DEFAULT_THRESHOLD,
};
