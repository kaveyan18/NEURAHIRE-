// server/services/educationAnalyzer.service.js
// Analyzes the Education section of a resume.
// Scores degree level, field relevance, GPA mentions, and certifications.

'use strict';

// ─── Degree Level Map ─────────────────────────────────────────────────────────
// Higher = more valuable for software engineering roles
const DEGREE_PATTERNS = [
  { level: 'phd',      score: 100, pattern: /\b(ph\.?d|doctor(ate)?|d\.?phil)\b/i },
  { level: 'masters',  score: 85,  pattern: /\b(m\.?s\.?|m\.?e\.?|m\.?tech|master(s)?|mba)\b/i },
  { level: 'bachelors',score: 70,  pattern: /\b(b\.?s\.?|b\.?e\.?|b\.?tech|b\.?sc|bachelor(s)?|b\.?a\.?\b)\b/i },
  { level: 'diploma',  score: 45,  pattern: /\b(diploma|associate|a\.?a\.?|a\.?s\.?)\b/i },
  { level: 'bootcamp', score: 35,  pattern: /\b(bootcamp|boot\s*camp|coding school|nanodegree|online course)\b/i },
];

// CS / Engineering-related fields (bonus for relevance)
const RELEVANT_FIELDS = /\b(computer\s*science|software\s*(engineering|development)|information\s*technology|information\s*systems|electrical\s*engineering|electronics|data\s*science|artificial\s*intelligence|machine\s*learning|mathematics|statistics|physics|cybersecurity|computer\s*engineering)\b/i;

// GPA signals
const GPA_PATTERN = /\b(gpa|cgpa|grade\s*point)\s*:?\s*(\d+\.?\d*)\s*(\/\s*\d+\.?\d*)?\b/i;

// Graduation year extraction
const YEAR_PATTERN = /\b(20\d{2}|19\d{2})\b/g;

// Certification patterns
const CERT_PATTERNS = /\b(aws\s*certified|google\s*cloud|azure\s*certified|gcp|cka|ckad|pmp|scrum|agile|comptia|cisco|ccna|ccnp|oracle\s*certified|certified\s*kubernetes)\b/i;

// ─── Main Analyzer ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} EducationAnalysis
 * @property {number}   score        - 0–100
 * @property {string}   degreeLevel  - 'phd' | 'masters' | 'bachelors' | 'diploma' | 'bootcamp' | 'none'
 * @property {boolean}  relevant     - CS/Engineering field
 * @property {boolean}  hasGPA
 * @property {string[]} strengths
 * @property {string[]} weaknesses
 */

/**
 * Analyze the education section of a resume.
 *
 * @param {{ education: string[], certifications: string[], [key: string]: string[] }} sections
 * @returns {EducationAnalysis}
 */
function analyzeEducation(sections) {
  const eduLines  = (sections.education      || []).filter(l => l.trim().length > 0);
  const certLines = (sections.certifications || []).filter(l => l.trim().length > 0);
  const allEduText = [...eduLines, ...certLines].join('\n');

  if (allEduText.trim().length === 0) {
    return {
      score: 20,  // mild base score — missing education is uncommon
      degreeLevel: 'none',
      relevant: false,
      hasGPA: false,
      strengths: [],
      weaknesses: ['No education section detected. Even if self-taught, add your degree, diploma, or relevant certifications.'],
    };
  }

  const strengths  = [];
  const weaknesses = [];
  let rawScore = 0;

  // ── 1. Degree Level Score (0–60) ──────────────────────────────────────────
  let degreeLevel = 'none';
  let degreeScore = 0;

  for (const { level, score, pattern } of DEGREE_PATTERNS) {
    if (pattern.test(allEduText)) {
      degreeLevel = level;
      degreeScore = score;
      break; // take the highest-level match (patterns ordered high→low)
    }
  }

  // Map degree score → contribution toward rawScore (max 60)
  const degreeContrib = Math.round((degreeScore / 100) * 60);
  rawScore += degreeContrib;

  switch (degreeLevel) {
    case 'phd':      strengths.push('PhD-level education — strong differentiator for research/senior roles.'); break;
    case 'masters':  strengths.push("Master's degree detected."); break;
    case 'bachelors':strengths.push("Bachelor's degree detected."); break;
    case 'diploma':  strengths.push('Diploma/Associate degree detected.'); break;
    case 'bootcamp': strengths.push('Bootcamp/online certification detected.'); break;
    case 'none':     weaknesses.push('Could not detect a degree level. Specify your degree (B.Tech, B.S., M.S., etc.) clearly.'); break;
  }

  // ── 2. Field Relevance Bonus (0–20) ───────────────────────────────────────
  const isRelevant = RELEVANT_FIELDS.test(allEduText);
  if (isRelevant) {
    rawScore += 20;
    strengths.push('Degree field is directly relevant to software engineering.');
  } else {
    rawScore += 5; // small credit for having any degree
    weaknesses.push('Degree field does not appear directly CS/Engineering-related. This is fine — highlight relevant coursework or self-study.');
  }

  // ── 3. GPA Mention Bonus (0–10) ───────────────────────────────────────────
  const gpaMatch = allEduText.match(GPA_PATTERN);
  const hasGPA   = !!gpaMatch;
  if (hasGPA) {
    rawScore += 10;
    strengths.push('GPA/CGPA mentioned — good for academic credibility.');
  } else {
    weaknesses.push('No GPA/CGPA mentioned. If your GPA is 3.5+ (or 8.0+/10), include it.');
  }

  // ── 4. Certifications Bonus (0–10) ────────────────────────────────────────
  const hasCerts = CERT_PATTERNS.test(allEduText);
  if (hasCerts) {
    rawScore += 10;
    strengths.push('Industry certifications detected (AWS, GCP, Kubernetes, etc.).');
  } else if (certLines.length > 0) {
    rawScore += 5;
    strengths.push('Certifications section present.');
  }

  return {
    score:       Math.min(100, Math.max(0, rawScore)),
    degreeLevel,
    relevant:    isRelevant,
    hasGPA,
    strengths:   strengths.slice(0, 4),
    weaknesses:  weaknesses.slice(0, 4),
  };
}

module.exports = { analyzeEducation };
