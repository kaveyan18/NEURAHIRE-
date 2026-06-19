// server/services/ats.service.js
const natural = require('natural');
const { embed, isEmbedderReady, embedderFailed } = require('./embedder');

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const STOP_WORDS = new Set(natural.stopwords);

const ACRONYMS = {
  js: 'javascript', ts: 'typescript', py: 'python',
  ml: 'machine learning', ai: 'artificial intelligence',
  api: 'application programming interface', db: 'database',
  ci: 'continuous integration', cd: 'continuous deployment',
  oop: 'object oriented programming', sql: 'structured query language',
  aws: 'amazon web services', gcp: 'google cloud platform',
};

const SECTION_WEIGHTS = { skills: 1.5, experience: 1.2, education: 1.0, summary: 0.8, other: 0.7 };

const MAX_RESUME_CHARS = 15000;
const MAX_JD_CHARS = 8000;
const MAX_PHRASES_PER_DOC = 250;

// ── Section detection ─────────────────────────────────────────────────────────
function detectSections(text) {
  const lines = text.split('\n');
  const sections = { skills: [], experience: [], education: [], summary: [], other: [] };
  let current = 'other';
  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (/\b(skill|technology|tech stack|tools)\b/.test(lower))       current = 'skills';
    else if (/\b(experience|work|employment|project)\b/.test(lower)) current = 'experience';
    else if (/\b(education|degree|university|college)\b/.test(lower)) current = 'education';
    else if (/\b(summary|objective|profile|about)\b/.test(lower))    current = 'summary';
    sections[current].push(line);
  }
  return sections;
}

function expandAcronyms(text) {
  return text.toLowerCase().replace(/\b(\w+)\b/g, w => ACRONYMS[w] || w);
}

function normalizeTokens(text) {
  const tokens = tokenizer.tokenize(expandAcronyms(text)) || [];
  return tokens.filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function extractPhrases(text) {
  const tokens = normalizeTokens(text).filter(t => !STOP_WORDS.has(t) || t.length <= 2);
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i++) bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  return [...new Set([...tokens, ...bigrams])].slice(0, MAX_PHRASES_PER_DOC);
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

// ── TF-IDF layer (always runs — the reliable backbone) ────────────────────────
function tfidfScore(resumeText, jobDescription, sections) {
  const resumeTokenMap = new Map();
  for (const [section, lines] of Object.entries(sections)) {
    const weight = SECTION_WEIGHTS[section];
    for (const stem of normalizeTokens(lines.join(' ')).map(t => stemmer.stem(t))) {
      resumeTokenMap.set(stem, Math.max(resumeTokenMap.get(stem) || 0, weight));
    }
  }

  const tfidf = new natural.TfIdf();
  tfidf.addDocument(jobDescription.toLowerCase());
  const jdStems = [...new Set(normalizeTokens(jobDescription).map(t => stemmer.stem(t)))];

  const matched = [], missing = [];
  let matchedWeight = 0, totalWeight = 0;

  for (const stem of jdStems) {
    const jdScore = tfidf.tfidf(stem, 0) || 0.1;
    totalWeight += jdScore;
    const resumeWeight = resumeTokenMap.get(stem) || 0;
    if (resumeWeight > 0) { matched.push(stem); matchedWeight += jdScore * resumeWeight; }
    else missing.push({ stem, jdScore });
  }

  const score = totalWeight > 0 ? Math.min(100, (matchedWeight / totalWeight) * 100) : 0;
  return { score, matchedStems: new Set(matched), missing };
}

// ── Semantic layer (best-effort — degrades gracefully) ────────────────────────
async function semanticBoost(resumeText, jobDescription, sections, tfidfMissing) {
  if (tfidfMissing.length === 0) return { recoveredMatches: [], stillMissing: [] };

  const resumePhrases = extractPhrases(resumeText);
  const missingPhrases = tfidfMissing.map(m => m.stem);

  const allTexts = [...missingPhrases, ...resumePhrases];
  const vectors = await embed(allTexts);

  if (!vectors) {
    return { recoveredMatches: [], stillMissing: tfidfMissing };
  }

  const missingVecs = vectors.slice(0, missingPhrases.length);
  const resumeVecs = vectors.slice(missingPhrases.length);

  const THRESHOLD = 0.72;
  const recoveredMatches = [];
  const stillMissing = [];

  for (let i = 0; i < missingPhrases.length; i++) {
    let best = 0;
    for (let j = 0; j < resumeVecs.length; j++) {
      const sim = cosine(missingVecs[i], resumeVecs[j]);
      if (sim > best) best = sim;
    }
    if (best >= THRESHOLD) recoveredMatches.push({ ...tfidfMissing[i], simScore: best });
    else stillMissing.push(tfidfMissing[i]);
  }

  return { recoveredMatches, stillMissing };
}

// ── Suggestions ────────────────────────────────────────────────────────────────
function buildSuggestions(topMissing, sections) {
  const suggestions = [];
  const skillsText = sections.skills.join(' ').toLowerCase();
  const expText = sections.experience.join(' ').toLowerCase();

  for (const { stem } of topMissing) {
    if (suggestions.length >= 3) break;
    if (!skillsText.includes(stem)) {
      suggestions.push(`Add "${stem}" to your Skills section — it's a key term in this job description.`);
    } else if (!expText.includes(stem)) {
      suggestions.push(`Mention "${stem}" with a quantified example in your Experience section.`);
    } else {
      suggestions.push(`Increase usage of "${stem}" — it's weighted heavily in the JD but underrepresented in your resume.`);
    }
  }
  const pads = [
    'Quantify achievements with metrics (%, $, time) in every Experience bullet.',
    'Mirror the exact job title from the posting in your Summary section.',
    'Use a single-column text PDF — tables and multi-column layouts break ATS parsers.',
  ];
  while (suggestions.length < 3) suggestions.push(pads[suggestions.length]);
  return suggestions;
}

// ── Main entry point ───────────────────────────────────────────────────────────
async function analyzeWithATS(resumeText, jobDescription) {
  if (!resumeText?.trim() || !jobDescription?.trim()) {
    throw new ATSError('Resume text and job description are both required.', 400);
  }

  const resume = resumeText.slice(0, MAX_RESUME_CHARS);
  const jd = jobDescription.slice(0, MAX_JD_CHARS);

  const sections = detectSections(resume);

  // Layer 1: TF-IDF (always succeeds — pure JS, no external model)
  const { score: tfidfScoreVal, matchedStems, missing: tfidfMissing } = tfidfScore(resume, jd, sections);

  // Layer 2: semantic recovery on TF-IDF's missing list (best-effort)
  let recoveredMatches = [], stillMissing = tfidfMissing;
  try {
    const result = await semanticBoost(resume, jd, sections, tfidfMissing);
    recoveredMatches = result.recoveredMatches;
    stillMissing = result.stillMissing;
  } catch (err) {
    console.warn('[ATS] Semantic layer failed, using TF-IDF only:', err.message);
  }

  // Blend: TF-IDF score + bonus for semantically recovered matches
  const totalJdTerms = tfidfMissing.length + matchedStems.size;
  const recoveredBonus = totalJdTerms > 0 ? (recoveredMatches.length / totalJdTerms) * 100 : 0;
  const finalScore = Math.min(100, Math.round(tfidfScoreVal + recoveredBonus * 0.6));

  const topMissing = stillMissing
    .sort((a, b) => b.jdScore - a.jdScore)
    .slice(0, 10);

  const suggestions = buildSuggestions(topMissing, sections);

  return {
    score: finalScore,
    matched_keywords: recoveredMatches.map(m => m.stem).slice(0, 20),
    missing_keywords: topMissing.map(m => m.stem),
    suggestions,
    meta: {
      semantic_layer_used: isEmbedderReady(),
      semantic_layer_failed: embedderFailed(),
    },
  };
}

class ATSError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { analyzeWithATS, ATSError };