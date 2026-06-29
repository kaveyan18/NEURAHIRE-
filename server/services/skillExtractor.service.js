// server/services/skillExtractor.service.js
// Extracts technical skills from text using four complementary strategies:
//   A) Dictionary lookup (primary)
//   B) Regex version-qualified patterns
//   C) Named Entity Recognition via compromise
//   D) Sliding-window n-gram extraction
// All strategies share a deduplication + weight aggregation step.

'use strict';

const nlp = require('compromise');
const { lookupSkill, isReady } = require('./skillDictionary.service');
const { normalizeSkillToken, isGenericWord, tokenize, extractNgrams, normalizeText } = require('./normalizer.service');

// ─── Extra regex patterns for versioned/qualified skills ──────────────────────
// These catch things like "Python 3.10", "React 18", "Node 20"
const VERSION_PATTERNS = [
  /\bpython\s*[23](?:\.\d+)?\b/gi,
  /\bnode(?:\.js)?\s*(?:v?\d+(?:\.\d+)?)?\b/gi,
  /\breact\s*(?:v?\d+(?:\.\d+)?)?\b/gi,
  /\bjava\s*(?:se\s*)?\d+\b/gi,
  /\bangular\s*\d+\b/gi,
  /\bvue\s*[23]\b/gi,
  /\bspring\s+boot\s*\d+(?:\.\d+)?\b/gi,
  /\b\.net\s*\d+(?:\.\d+)?\b/gi,
  /\btypescript\s*\d+(?:\.\d+)?\b/gi,
  /\bkubernetes\s*v?\d+(?:\.\d+)?\b/gi,
];

// ─── Acronym regex for common all-caps tech terms ─────────────────────────────
const ACRONYM_PATTERN = /\b(JWT|RBAC|ABAC|OAuth|OIDC|SSO|SAML|REST|API|APIs|SQL|NoSQL|OOP|OOPS|MVP|MVC|MVVM|DDD|CQRS|TDD|BDD|CI|CD|AWS|GCP|EC2|S3|RDS|SQS|SNS|ECS|EKS|IAM|VPC|CDN|SSL|TLS|CORS|CSP|XSS|CSRF|SQLI|gRPC|RPC|SSR|SSG|SPA|PWA|SEO|NLP|ML|AI|LLM|RAG|ETL|ELT|DAG|DSA|BFS|DFS|ACID|CAP|DNS|TCP|UDP|HTTP|HTTPS|FTP|SSH|MQTT|AMQP|ELK|APM|SRE|CI\/CD|K8S|IaC|IAC|HA|RAG)\b/g;

/**
 * @typedef {Object} ExtractedSkill
 * @property {string}   canonical     - canonical skill name from dictionary
 * @property {string}   raw           - original text that triggered this match
 * @property {string}   category      - skill category (from dictionary)
 * @property {number}   baseWeight    - dictionary weight
 * @property {number}   sectionWeight - weight of the section it was found in
 * @property {number}   occurrences   - how many times this skill appeared
 * @property {string}   source        - which strategy found it: 'dictionary'|'regex'|'ner'|'ngram'
 */

/**
 * Extract all technical skills from a text chunk belonging to a specific section.
 *
 * @param {string} text           - text to extract from
 * @param {number} sectionWeight  - weight for this section (from SECTION_WEIGHTS)
 * @returns {ExtractedSkill[]}
 */
function extractSkills(text, sectionWeight = 1.0) {
  if (!text || typeof text !== 'string') return [];

  /** @type {Map<string, ExtractedSkill>} canonical → aggregated entry */
  const skillMap = new Map();

  const normalized = normalizeText(text);

  _strategyA_dictionary(normalized, sectionWeight, skillMap);
  _strategyB_regex(text, sectionWeight, skillMap);     // use raw text for regex to catch case
  _strategyC_ner(normalized, sectionWeight, skillMap);
  // strategy D is subsumed by A (ngrams are handled inside A)

  return Array.from(skillMap.values())
    .sort((a, b) => (b.baseWeight * b.sectionWeight * b.occurrences) - (a.baseWeight * a.sectionWeight * a.occurrences));
}

/**
 * Extract skills from all sections at once, applying per-section weights.
 *
 * @param {{ text: string, weight: number, section: string }[]} weightedChunks
 * @returns {ExtractedSkill[]}
 */
function extractSkillsFromSections(weightedChunks) {
  /** @type {Map<string, ExtractedSkill>} */
  const globalMap = new Map();

  for (const { text, weight, section } of weightedChunks) {
    const sectionSkills = extractSkills(text, weight);
    for (const skill of sectionSkills) {
      _mergeSkill(globalMap, skill);
    }
  }

  return Array.from(globalMap.values())
    .sort((a, b) => (b.baseWeight * b.sectionWeight * b.occurrences) - (a.baseWeight * a.sectionWeight * a.occurrences));
}

// ─── Strategy A: Dictionary + N-gram lookup ───────────────────────────────────

function _strategyA_dictionary(normalizedText, sectionWeight, skillMap) {
  const tokens = tokenize(normalizedText);

  // Generate 1-gram, 2-gram, 3-gram windows
  const ngrams = extractNgrams(tokens, 3);

  for (const ngram of ngrams) {
    const normalized = normalizeSkillToken(ngram);
    if (!normalized || isGenericWord(normalized)) continue;

    const entry = lookupSkill(normalized);
    if (entry) {
      _addToMap(skillMap, entry, ngram, sectionWeight, 'dictionary');
    }
  }
}

// ─── Strategy B: Regex patterns ───────────────────────────────────────────────

function _strategyB_regex(rawText, sectionWeight, skillMap) {
  // Version-qualified skills
  for (const pattern of VERSION_PATTERNS) {
    const matches = rawText.match(pattern) || [];
    for (const match of matches) {
      const normalized = normalizeSkillToken(match);
      if (!normalized) continue;
      const entry = lookupSkill(normalized);
      if (entry) {
        _addToMap(skillMap, entry, match, sectionWeight, 'regex');
      }
    }
  }

  // All-caps acronyms
  const acronymMatches = rawText.match(ACRONYM_PATTERN) || [];
  for (const match of acronymMatches) {
    const normalized = normalizeSkillToken(match);
    if (!normalized || isGenericWord(normalized)) continue;
    const entry = lookupSkill(normalized);
    if (entry) {
      _addToMap(skillMap, entry, match, sectionWeight, 'regex');
    }
  }
}

// ─── Strategy C: Named Entity Recognition ────────────────────────────────────

function _strategyC_ner(normalizedText, sectionWeight, skillMap) {
  // Only run if dictionary is loaded (avoid false positives without context)
  if (!isReady()) return;

  try {
    const doc = nlp(normalizedText);

    // Extract proper nouns and acronyms
    const properNouns = [
      ...doc.match('#ProperNoun+').out('array'),
      ...doc.match('#Acronym').out('array'),
    ];

    for (const phrase of properNouns) {
      const normalized = normalizeSkillToken(phrase);
      if (!normalized || normalized.length < 2 || isGenericWord(normalized)) continue;
      const entry = lookupSkill(normalized);
      if (entry) {
        _addToMap(skillMap, entry, phrase, sectionWeight, 'ner');
      }
    }
  } catch {
    // NER failure is non-fatal
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _addToMap(skillMap, entry, rawMatch, sectionWeight, source) {
  const canonicalKey = normalizeSkillToken(entry.canonical);
  if (skillMap.has(canonicalKey)) {
    const existing = skillMap.get(canonicalKey);
    existing.occurrences += 1;
    // Keep the highest section weight seen
    if (sectionWeight > existing.sectionWeight) {
      existing.sectionWeight = sectionWeight;
    }
  } else {
    skillMap.set(canonicalKey, {
      canonical:     entry.canonical,
      raw:           rawMatch,
      category:      entry.category,
      baseWeight:    entry.weight || 1.0,
      sectionWeight,
      occurrences:   1,
      source,
    });
  }
}

function _mergeSkill(globalMap, skill) {
  const key = normalizeSkillToken(skill.canonical);
  if (globalMap.has(key)) {
    const existing = globalMap.get(key);
    existing.occurrences += skill.occurrences;
    if (skill.sectionWeight > existing.sectionWeight) {
      existing.sectionWeight = skill.sectionWeight;
    }
  } else {
    globalMap.set(key, { ...skill });
  }
}

module.exports = {
  extractSkills,
  extractSkillsFromSections,
};
