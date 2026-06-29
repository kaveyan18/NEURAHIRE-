// server/services/experienceAnalyzer.service.js
// Scores the Experience/Work History section of a resume holistically.
// Rewards engineering depth, quantified impact, production signals, and action verbs.
// Penalizes vague/passive language and lack of metrics.

'use strict';

// ─── Signal Sets ──────────────────────────────────────────────────────────────

// Strong engineering action verbs (start of bullet)
const ACTION_VERBS = new Set([
  'developed','designed','implemented','built','engineered','architected','created',
  'optimized','improved','reduced','increased','decreased','accelerated','streamlined',
  'automated','integrated','deployed','migrated','refactored','debugged','resolved',
  'led','owned','managed','mentored','reviewed','collaborated','contributed',
  'launched','shipped','delivered','released','established','introduced',
  'maintained','monitored','scaled','secured','upgraded','modernized',
  'investigated','researched','analysed','analyzed','evaluated','identified',
  'configured','provisioned','orchestrated','containerized','instrumented',
]);

// Weak / passive phrases that reduce score
const WEAK_PHRASES = [
  /\b(responsible for|worked on|helped (with|to)|assisted (in|with)|was involved in|participated in)\b/i,
  /\b(familiar with|exposure to|knowledge of|understanding of)\b/i,
  /\b(tried to|attempted to|helped the team)\b/i,
];

// Production / real-world signals
const PRODUCTION_SIGNALS = [
  /\b(production|live|deployed|customers?|enterprise|client|SLA|uptime|incident|on-call|24\/7)\b/i,
  /\b(millions?|billions?|thousands?|daily active|MAU|DAU)\b/i,
  /\b(revenue|cost saving|saved \$|earned|generated)\b/i,
];

// Metric patterns: numbers, percentages, multipliers, scale units
const METRIC_PATTERN = /\b(\d+\.?\d*\s*(%|x|ms|s\b|kb|mb|gb|tb|k\+?|m\+?|b\+?|req\/s|rps|tps|users?|requests?|transactions?|latency|throughput))\b/i;
const NUMBER_PATTERN = /\b\d{2,}\b/; // any number ≥ 10

// Seniority / leadership signals
const LEADERSHIP_SIGNALS = /\b(led|owned|architected|mentored|designed the|spearheaded|established|drove|oversaw|managed a team|cross-functional|stakeholder)\b/i;

// Internship indicators (slightly lower weight than FTE)
const INTERNSHIP_SIGNALS = /\b(intern|internship|co-op|coop|trainee|apprentice)\b/i;

// ─── Main Analyzer ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ExperienceAnalysis
 * @property {number}   score      - 0–100
 * @property {string[]} strengths  - positive signals found
 * @property {string[]} weaknesses - issues detected
 */

/**
 * Analyze the experience section of a resume.
 *
 * @param {{ experience: string[], [key: string]: string[] }} sections - detected resume sections
 * @returns {ExperienceAnalysis}
 */
function analyzeExperience(sections) {
  const expLines = [
    ...(sections.experience || []),
    // also pick up any internship content in other
    ...(sections.other || []).filter(l => INTERNSHIP_SIGNALS.test(l)),
  ].filter(l => l.trim().length > 0);

  if (expLines.length === 0) {
    return {
      score: 0,
      strengths: [],
      weaknesses: ['No experience section detected in your resume.'],
    };
  }

  const fullText = expLines.join(' ');
  const bullets  = _extractBullets(expLines);
  const isInternship = INTERNSHIP_SIGNALS.test(fullText);

  const strengths  = [];
  const weaknesses = [];
  let rawScore = 0;

  // ── 1. Action Verb Score (0–25) ───────────────────────────────────────────
  const bulletsWithActionVerb = bullets.filter(b => {
    const firstWord = b.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
    return ACTION_VERBS.has(firstWord);
  });
  const actionVerbRatio = bullets.length > 0 ? bulletsWithActionVerb.length / bullets.length : 0;
  const actionScore = Math.round(actionVerbRatio * 25);
  rawScore += actionScore;

  if (actionVerbRatio >= 0.7) strengths.push('Strong use of action verbs across experience bullets.');
  else if (actionVerbRatio >= 0.4) strengths.push('Some action verbs used; could be more consistent.');
  else weaknesses.push('Most bullets don\'t start with action verbs (e.g. Developed, Implemented, Optimized).');

  // ── 2. Metric / Quantification Score (0–25) ───────────────────────────────
  const bulletsWithMetrics = bullets.filter(b => METRIC_PATTERN.test(b) || NUMBER_PATTERN.test(b));
  const metricRatio = bullets.length > 0 ? bulletsWithMetrics.length / bullets.length : 0;
  const metricScore = Math.round(metricRatio * 25);
  rawScore += metricScore;

  if (metricRatio >= 0.5) strengths.push('Good use of quantified metrics and numbers in bullets.');
  else if (metricRatio >= 0.2) weaknesses.push('Only some bullets contain measurable outcomes. Aim to quantify at least 50% of your impact bullets.');
  else weaknesses.push('Experience bullets lack quantified impact. Add metrics like response times, user counts, or performance gains (e.g. "reduced latency by 40%").');

  // ── 3. Production / Real-world Signal Score (0–20) ────────────────────────
  const prodSignalCount = PRODUCTION_SIGNALS.filter(rx => rx.test(fullText)).length;
  const prodScore = Math.min(20, prodSignalCount * 7);
  rawScore += prodScore;

  if (prodSignalCount >= 2) strengths.push('Resume signals real-world production experience.');
  else if (prodSignalCount === 1) strengths.push('Some production context detected.');
  else weaknesses.push('No production or real-world deployment signals found (e.g. "production", "live", "customers", "SLA").');

  // ── 4. Weak Phrase Penalty (0–15, subtractive) ────────────────────────────
  const weakPhraseCount = bullets.filter(b => WEAK_PHRASES.some(rx => rx.test(b))).length;
  const weakPenalty = Math.min(15, weakPhraseCount * 5);
  const weakPhraseScore = 15 - weakPenalty;
  rawScore += weakPhraseScore;

  if (weakPhraseCount === 0) strengths.push('No weak or passive language detected in bullets.');
  else weaknesses.push(`${weakPhraseCount} bullet(s) use weak phrasing ("responsible for", "helped with", etc.). Replace with strong action verbs.`);

  // ── 5. Leadership / Seniority Signal (0–10) ───────────────────────────────
  const hasLeadership = LEADERSHIP_SIGNALS.test(fullText);
  if (hasLeadership) {
    rawScore += 10;
    strengths.push('Leadership and ownership language present (e.g. led, owned, architected).');
  } else {
    weaknesses.push('No leadership or ownership signals found. Consider adding scope/ownership context.');
  }

  // ── 6. Experience Volume (0–5) ────────────────────────────────────────────
  // At least 3 bullets per role signals depth
  if (bullets.length >= 6)      rawScore += 5;
  else if (bullets.length >= 3) rawScore += 3;
  else weaknesses.push('Experience section is sparse. Aim for at least 3–5 detailed bullets per role.');

  // ── Internship Dampener ───────────────────────────────────────────────────
  // Internship experience is valuable but weighted slightly less than FTE
  let finalScore = Math.min(100, rawScore);
  if (isInternship && expLines.length < 15) {
    finalScore = Math.round(finalScore * 0.85);
    strengths.push('Internship experience detected — solid for early-career candidates.');
  }

  return {
    score:     finalScore,
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract bullet-like lines from the experience section.
 * Bullets typically start with •, -, *, or an action verb.
 */
function _extractBullets(lines) {
  return lines
    .map(l => l.replace(/^[\s•\-\*–]+/, '').trim())
    .filter(l => l.length > 20 && l.length < 500); // exclude headers and empty lines
}

module.exports = { analyzeExperience };
