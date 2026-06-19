// server/services/ats.service.js
const natural = require('natural');
const nlp = require('compromise');
const { embed, isEmbedderReady, embedderFailed } = require('./embedder');

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const STOP_WORDS = new Set(natural.stopwords);

// ── EXTRA stop words: generic English / JD-boilerplate that survives
// natural's default list and POS tagging alone won't catch (e.g. nouns
// that are technically real nouns but never resume-worthy: "role", "team").
const EXTRA_STOP_WORDS = new Set([
  'job', 'role', 'work', 'works', 'working', 'worked',
  'will', 'shall', 'must', 'should', 'would', 'could', 'can',
  'help', 'helps', 'helping',
  'fast', 'quickly', 'quick',
  'complex', 'complicated', 'simple',
  'smart', 'effort', 'efforts',
  'tier', 'level', 'good', 'great', 'strong', 'excellent',
  'ability', 'able', 'looking', 'seek', 'seeking', 'seeks',
  'team', 'teams', 'company', 'companies', 'organization',
  'environment', 'opportunity', 'opportunities',
  'responsible', 'responsibilities', 'duty', 'duties',
  'including', 'include', 'includes', 'related', 'etc',
  'years', 'year', 'plus', 'using', 'use', 'used',
  'new', 'also', 'well', 'across', 'within', 'various',
  // generic action verbs that show up constantly in JD prose but are
  // never themselves a "keyword" to add to a resume
  'implement', 'plan', 'meet', 'test', 'call', 'drive', 'driving',
  'manage', 'managing', 'support', 'supporting', 'ensure', 'ensuring',
  'provide', 'providing', 'lead', 'leading', 'own', 'owning',
  // domain fragments / corporate boilerplate that leak from address
  // blocks, legal entity names, and email/url fragments
  'com', 'www', 'http', 'https', 'inc', 'llc', 'ltd', 'corp',
  'adci', // Amazon Development Centre India — legal entity fragment, not a skill
  'someone', 'anyone', 'everyone', 'something', 'anything', 'everything',
  'who', 'whoever', 'whom', 'whose',
]);

// ── Known Indian states/major cities — JDs often list office locations
// (e.g. "ADCI - Karnataka") which should never appear as a skill gap.
const LOCATION_NOISE = new Set([
  'karnataka', 'maharashtra', 'telangana', 'tamil', 'nadu', 'haryana',
  'bangalore', 'bengaluru', 'hyderabad', 'mumbai', 'pune', 'gurgaon',
  'gurugram', 'chennai', 'delhi', 'noida', 'kolkata', 'india',
]);

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
const MIN_TOKEN_LENGTH = 3;

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

function isStopWord(token) {
  return STOP_WORDS.has(token)
    || EXTRA_STOP_WORDS.has(token)
    || LOCATION_NOISE.has(token)
    || token.length < MIN_TOKEN_LENGTH;
}

// ── POS-aware noun extraction ──────────────────────────────────────────────────
// compromise tags each word's part of speech. We keep nouns, proper nouns,
// and acronyms/tech-terms (which compromise sometimes mis-tags as verbs —
// e.g. "deploy", "scale" — so we use a technical-term allowlist override).
const TECH_VERB_ALLOWLIST = new Set([
  'deploy', 'deployed', 'deploying', 'scale', 'scaled', 'scaling',
  'build', 'built', 'building', 'design', 'designed', 'designing',
  'develop', 'developed', 'developing', 'integrate', 'integrated',
  'automate', 'automated', 'optimize', 'optimized', 'migrate', 'migrated',
  'monitor', 'monitored', 'debug', 'debugged', 'configure', 'configured',
]);

function extractNounsAndTechTerms(text) {
  // Insert a space after sentence-ending punctuation BEFORE POS tagging.
  // Without this, "deadlines.Must test" gets read as one run-on token
  // and compromise/tokenizer can leave the period stuck to the word.
  const spaced = text.replace(/([.;,])(\S)/g, '$1 $2');
  const doc = nlp(expandAcronyms(spaced));

  const nouns = doc.nouns().out('array').map(n => n.toLowerCase());

  const allTokens = tokenizer.tokenize(expandAcronyms(spaced)) || [];
  const techTerms = allTokens.filter(t => TECH_VERB_ALLOWLIST.has(t.toLowerCase()));

  const combined = [...nouns, ...techTerms]
    .flatMap(phrase => phrase.split(/\s+/))
    .map(t => t.replace(/[^a-z0-9+#]/gi, '')) // strip ALL punctuation, not just leading/trailing
    .filter(t => t.length > 0 && !isStopWord(t) && /^[a-z0-9+#]+$/i.test(t));

  return combined;
}

function normalizeTokens(text) {
  return extractNounsAndTechTerms(text);
}

function extractPhrases(text) {
  const tokens = normalizeTokens(text);
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    if (!isStopWord(tokens[i]) && !isStopWord(tokens[i + 1])) {
      bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
    }
  }
  return [...new Set([...tokens, ...bigrams])].slice(0, MAX_PHRASES_PER_DOC);
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

// ── Stem ↔ original word memory ────────────────────────────────────────────────
function stemWithMemory(token, memoryMap) {
  const stem = stemmer.stem(token);
  if (!memoryMap.has(stem)) memoryMap.set(stem, token);
  return stem;
}

function readable(stem, memoryMap) {
  return memoryMap.get(stem) || stem;
}

// ── TF-IDF layer (always runs — the reliable backbone) ────────────────────────
function tfidfScore(resumeText, jobDescription, sections, stemMemory) {
  const resumeTokenMap = new Map();
  for (const [section, lines] of Object.entries(sections)) {
    const weight = SECTION_WEIGHTS[section];
    for (const token of normalizeTokens(lines.join(' '))) {
      const stem = stemWithMemory(token, stemMemory);
      resumeTokenMap.set(stem, Math.max(resumeTokenMap.get(stem) || 0, weight));
    }
  }

  const tfidf = new natural.TfIdf();
  tfidf.addDocument(jobDescription.toLowerCase());
  tfidf.addDocument(resumeText.toLowerCase());

  const jdTokens = normalizeTokens(jobDescription);
  const jdStems = [...new Set(jdTokens.map(t => stemWithMemory(t, stemMemory)))];

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
async function semanticBoost(resumeText, jobDescription, sections, tfidfMissing, stemMemory) {
  if (tfidfMissing.length === 0) return { recoveredMatches: [], stillMissing: [] };

  const resumePhrases = extractPhrases(resumeText);
  const missingPhrases = tfidfMissing.map(m => readable(m.stem, stemMemory));

  const allTexts = [...missingPhrases, ...resumePhrases];
  const vectors = await embed(allTexts);

  if (!vectors) {
    return { recoveredMatches: [], stillMissing: tfidfMissing };
  }

  const missingVecs = vectors.slice(0, missingPhrases.length);
  const resumeVecs = vectors.slice(missingPhrases.length);

  const THRESHOLD = 0.80;
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
function buildSuggestions(topMissing, sections, stemMemory) {
  const suggestions = [];
  const skillsText = sections.skills.join(' ').toLowerCase();
  const expText = sections.experience.join(' ').toLowerCase();

  for (const { stem } of topMissing) {
    if (suggestions.length >= 3) break;
    const word = readable(stem, stemMemory);
    if (!skillsText.includes(stem)) {
      suggestions.push(`Add "${word}" to your Skills section — it's a key term in this job description.`);
    } else if (!expText.includes(stem)) {
      suggestions.push(`Mention "${word}" with a quantified example in your Experience section.`);
    } else {
      suggestions.push(`Increase usage of "${word}" — it's weighted heavily in the JD but underrepresented in your resume.`);
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
  const stemMemory = new Map();

  const { score: tfidfScoreVal, matchedStems, missing: tfidfMissing } =
    tfidfScore(resume, jd, sections, stemMemory);

  let recoveredMatches = [], stillMissing = tfidfMissing;
  try {
    const result = await semanticBoost(resume, jd, sections, tfidfMissing, stemMemory);
    recoveredMatches = result.recoveredMatches;
    stillMissing = result.stillMissing;
  } catch (err) {
    console.warn('[ATS] Semantic layer failed, using TF-IDF only:', err.message);
  }

  const totalJdTerms = tfidfMissing.length + matchedStems.size;
  const recoveredBonus = totalJdTerms > 0 ? (recoveredMatches.length / totalJdTerms) * 100 : 0;
  const finalScore = Math.min(100, Math.round(tfidfScoreVal + recoveredBonus * 0.6));

  const topMissing = stillMissing
    .sort((a, b) => b.jdScore - a.jdScore)
    .slice(0, 10);

  const suggestions = buildSuggestions(topMissing, sections, stemMemory);

  const allMatchedStems = [...matchedStems, ...recoveredMatches.map(m => m.stem)];
  const uniqueMatched = [...new Set(allMatchedStems)];

  return {
    score: finalScore,
    matched_keywords: uniqueMatched.map(s => readable(s, stemMemory)).slice(0, 20),
    missing_keywords: topMissing.map(m => readable(m.stem, stemMemory)),
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