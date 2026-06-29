// server/services/resumeQualityAnalyzer.service.js
// Evaluates overall resume structure, formatting, and writing quality.
// Checks section presence, contact info, bullet quality, and weak language.

'use strict';

// ─── Signal Definitions ───────────────────────────────────────────────────────

// Weak / passive phrases to penalize
const WEAK_PHRASE_PATTERNS = [
  { pattern: /\b(responsible for)\b/gi,       label: '"responsible for"' },
  { pattern: /\b(worked on)\b/gi,             label: '"worked on"' },
  { pattern: /\b(helped (with|to))\b/gi,      label: '"helped with/to"' },
  { pattern: /\b(assisted (in|with))\b/gi,    label: '"assisted in/with"' },
  { pattern: /\b(was involved in)\b/gi,        label: '"was involved in"' },
  { pattern: /\b(participated in)\b/gi,        label: '"participated in"' },
  { pattern: /\b(familiar with)\b/gi,          label: '"familiar with"' },
  { pattern: /\b(exposure to)\b/gi,            label: '"exposure to"' },
  { pattern: /\b(knowledge of)\b/gi,           label: '"knowledge of"' },
  { pattern: /\b(tried to)\b/gi,              label: '"tried to"' },
];

// Filler words
const FILLER_PATTERNS = [
  /\b(various|several|many|etc\.?|and more|and so on|including but not limited to)\b/gi,
];

// Contact link signals
const CONTACT_PATTERNS = {
  email:    /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/,
  phone:    /\b(\+?\d[\d\s\-().]{7,}\d)\b/,
  linkedin: /linkedin\.com\/in\//i,
  github:   /github\.com\//i,
  portfolio:/\b(portfolio|personal\s*site|mysite|website)\b/i,
};

// Ideal resume word count range
const MIN_WORDS = 250;
const MAX_WORDS = 900;

// Essential sections
const ESSENTIAL_SECTIONS = ['experience', 'skills', 'education'];
const RECOMMENDED_SECTIONS = ['projects', 'summary', 'certifications'];

// ─── Main Analyzer ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} QualityAnalysis
 * @property {number}   score        - 0–100
 * @property {string[]} issues       - detected problems
 * @property {string[]} strengths    - detected positives
 * @property {object}   contactLinks - { email, phone, linkedin, github, portfolio }
 * @property {number}   wordCount
 */

/**
 * Analyze overall resume quality and formatting.
 *
 * @param {{ [section: string]: string[] }} sections - detected resume sections
 * @returns {QualityAnalysis}
 */
function analyzeResumeQuality(sections) {
  const fullText = Object.values(sections).flat().join('\n');
  const wordCount = fullText.trim().split(/\s+/).length;

  const issues    = [];
  const strengths = [];
  let rawScore = 0;

  // ── 1. Section Presence (0–30) ────────────────────────────────────────────
  const sectionLines = {
    experience:     (sections.experience     || []).join(' ').trim(),
    skills:         (sections.skills         || []).join(' ').trim(),
    education:      (sections.education      || []).join(' ').trim(),
    projects:       (sections.projects       || []).join(' ').trim(),
    summary:        (sections.summary        || []).join(' ').trim(),
    certifications: (sections.certifications || []).join(' ').trim(),
  };

  const presentEssential    = ESSENTIAL_SECTIONS.filter(s => sectionLines[s].length > 20);
  const presentRecommended  = RECOMMENDED_SECTIONS.filter(s => sectionLines[s].length > 20);
  const missingEssential    = ESSENTIAL_SECTIONS.filter(s => sectionLines[s].length <= 20);
  const missingRecommended  = RECOMMENDED_SECTIONS.filter(s => sectionLines[s].length <= 20);

  const sectionScore = presentEssential.length * 8 + presentRecommended.length * 2;
  rawScore += Math.min(30, sectionScore);

  if (missingEssential.length === 0) {
    strengths.push('All essential sections present (Experience, Skills, Education).');
  } else {
    for (const s of missingEssential) {
      issues.push(`Missing essential section: "${s.charAt(0).toUpperCase() + s.slice(1)}". This is required by most ATS systems.`);
    }
  }

  if (sectionLines.summary.length <= 20) {
    issues.push('No summary/objective section found. A 2–3 sentence summary helps ATS systems and recruiters quickly assess your fit.');
  } else {
    strengths.push('Professional summary present.');
  }

  if (sectionLines.projects.length > 20) strengths.push('Projects section present.');
  else issues.push('No projects section detected. Adding projects significantly boosts ATS scores for software roles.');

  // ── 2. Contact Information (0–20) ─────────────────────────────────────────
  const contactLinks = {
    email:     CONTACT_PATTERNS.email.test(fullText),
    phone:     CONTACT_PATTERNS.phone.test(fullText),
    linkedin:  CONTACT_PATTERNS.linkedin.test(fullText),
    github:    CONTACT_PATTERNS.github.test(fullText),
    portfolio: CONTACT_PATTERNS.portfolio.test(fullText),
  };

  const contactCount = Object.values(contactLinks).filter(Boolean).length;
  rawScore += Math.min(20, contactCount * 4);

  if (contactLinks.linkedin) strengths.push('LinkedIn profile URL included.');
  else issues.push('Missing LinkedIn URL — recruiters and ATS systems use this to verify candidates.');

  if (contactLinks.github) strengths.push('GitHub profile URL included.');
  else issues.push('Missing GitHub profile URL — important for software engineering roles.');

  if (!contactLinks.email) issues.push('No email address detected on resume.');

  // ── 3. Weak Phrase Detection (0–20) ───────────────────────────────────────
  const foundWeakPhrases = WEAK_PHRASE_PATTERNS.filter(({ pattern }) => {
    pattern.lastIndex = 0;
    return pattern.test(fullText);
  }).map(({ label }) => label);

  const weakScore = Math.max(0, 20 - foundWeakPhrases.length * 4);
  rawScore += weakScore;

  if (foundWeakPhrases.length === 0) {
    strengths.push('No weak or passive language detected.');
  } else {
    issues.push(`Weak phrases found: ${foundWeakPhrases.slice(0, 3).join(', ')}. Replace with strong action verbs.`);
  }

  // ── 4. Resume Length / Word Count (0–15) ──────────────────────────────────
  let lengthScore = 0;
  if (wordCount >= MIN_WORDS && wordCount <= MAX_WORDS) {
    lengthScore = 15;
    strengths.push(`Good resume length (${wordCount} words — within the 250–900 word ideal range).`);
  } else if (wordCount < MIN_WORDS) {
    lengthScore = Math.round((wordCount / MIN_WORDS) * 10);
    issues.push(`Resume is too short (${wordCount} words). Aim for at least ${MIN_WORDS} words with detailed bullets.`);
  } else {
    lengthScore = 8;
    issues.push(`Resume is long (${wordCount} words). Consider condensing to under ${MAX_WORDS} words for better readability.`);
  }
  rawScore += lengthScore;

  // ── 5. Filler Word Detection (0–10) ───────────────────────────────────────
  const fillerCount = FILLER_PATTERNS.reduce((acc, rx) => {
    const matches = fullText.match(rx);
    return acc + (matches ? matches.length : 0);
  }, 0);

  const fillerScore = Math.max(0, 10 - fillerCount * 2);
  rawScore += fillerScore;

  if (fillerCount === 0) strengths.push('No filler words detected (various, several, etc.).');
  else if (fillerCount > 3) issues.push(`Filler words found ${fillerCount} times ("various", "several", "etc."). Be specific instead.`);

  // ── 6. Repeated skills / content (0–5) ────────────────────────────────────
  const skillLines = (sections.skills || []).join(' ').toLowerCase();
  const expText    = (sections.experience || []).join(' ').toLowerCase();
  const hasRedundancy = skillLines.length > 0 && expText.length > 0;
  // Simple heuristic: if skills section is very long, likely has redundancy
  if ((sections.skills || []).length <= 20) {
    rawScore += 5;
    strengths.push('Skills section is concise and well-targeted.');
  } else {
    rawScore += 2;
    issues.push('Skills section may be overly long. Focus on the most relevant skills for this role.');
  }

  return {
    score:        Math.min(100, Math.max(0, rawScore)),
    issues:       issues.slice(0, 12),
    strengths:    strengths.slice(0, 6),
    contactLinks,
    wordCount,
  };
}

module.exports = { analyzeResumeQuality };
