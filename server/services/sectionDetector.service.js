// server/services/sectionDetector.service.js
// Detects resume/JD sections and assigns section-level context weights.

'use strict';

/**
 * Section weight multipliers used during ATS scoring.
 * Higher weight = skills here contribute more to the score.
 */
const SECTION_WEIGHTS = {
  skills:          1.5,
  experience:      1.3,
  projects:        1.2,
  education:       1.0,
  certifications:  0.9,
  summary:         0.7,
  other:           0.5,
};

/**
 * Regex matchers for each section heading.
 * Ordered from most specific to most generic.
 */
const SECTION_PATTERNS = [
  { name: 'certifications', pattern: /\b(certification|certifications|certificate|certificates|licenses?|accreditation)\b/i },
  { name: 'projects',       pattern: /\b(project|projects|personal project|side project|open.?source|portfolio)\b/i },
  { name: 'skills',         pattern: /\b(skill|skills|technical skill|technology|technologies|tech stack|tools|competencies|expertise|proficiencies)\b/i },
  { name: 'experience',     pattern: /\b(experience|work experience|professional experience|employment|work history|career history|internship|job history)\b/i },
  { name: 'education',      pattern: /\b(education|academic|degree|university|college|school|qualification|courses?|coursework)\b/i },
  { name: 'summary',        pattern: /\b(summary|objective|profile|about me|professional summary|career objective|personal statement)\b/i },
];

/**
 * Detect whether a line is a section heading.
 * A heading line is typically short (< 60 chars), mostly uppercase or title-case,
 * and matches one of our section patterns.
 *
 * @param {string} line
 * @returns {string|null} section name or null
 */
function detectSectionHeading(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 80) return null;

  // Look for a pattern match
  for (const { name, pattern } of SECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return name;
    }
  }
  return null;
}

/**
 * Split raw resume/JD text into labelled sections.
 *
 * @param {string} text - raw extracted text
 * @returns {{ skills: string[], experience: string[], projects: string[], education: string[], certifications: string[], summary: string[], other: string[] }}
 */
function detectSections(text) {
  const sections = {
    skills:         [],
    experience:     [],
    projects:       [],
    education:      [],
    certifications: [],
    summary:        [],
    other:          [],
  };

  const lines = text.split('\n');
  let current = 'other';

  for (const line of lines) {
    const heading = detectSectionHeading(line);
    if (heading) {
      current = heading;
    }
    sections[current].push(line);
  }

  return sections;
}

/**
 * Flatten all sections into a single weighted token list.
 * Each token is returned with its section weight.
 *
 * @param {{ [section: string]: string[] }} sections
 * @returns {{ text: string, weight: number }[]}
 */
function getSectionWeightedChunks(sections) {
  return Object.entries(sections).map(([section, lines]) => ({
    text: lines.join(' '),
    weight: SECTION_WEIGHTS[section] ?? 0.5,
    section,
  }));
}

/**
 * Detect JD priority signals: "required", "preferred", "nice to have".
 * Returns a Map of lowercased phrases → their priority weight.
 *
 * @param {string} jdText
 * @returns {{ required: string[], preferred: string[], niceToHave: string[] }}
 */
function detectJDPriority(jdText) {
  const lower = jdText.toLowerCase();
  const lines = lower.split('\n');

  const required = [];
  const preferred = [];
  const niceToHave = [];

  const REQUIRED_RE     = /\b(required|must have|must-have|mandatory|essential|need to have|critical)\b/;
  const PREFERRED_RE    = /\b(preferred|should have|desirable|desired|we prefer|ideally)\b/;
  const NICE_TO_HAVE_RE = /\b(nice to have|nice-to-have|bonus|plus|advantage|good to have|optional|would be a plus)\b/;

  for (const line of lines) {
    if (REQUIRED_RE.test(line))       required.push(line.trim());
    else if (PREFERRED_RE.test(line)) preferred.push(line.trim());
    else if (NICE_TO_HAVE_RE.test(line)) niceToHave.push(line.trim());
  }

  return { required, preferred, niceToHave };
}

module.exports = {
  detectSections,
  detectSectionHeading,
  getSectionWeightedChunks,
  detectJDPriority,
  SECTION_WEIGHTS,
};
