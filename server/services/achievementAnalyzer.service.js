// server/services/achievementAnalyzer.service.js
// Detects quantified achievements and impact signals across the entire resume.
// Rewards numbers, percentages, scale metrics, and award language.

'use strict';

// ─── Signal Definitions ───────────────────────────────────────────────────────

// Quantified impact patterns — the gold standard of achievement signals
const METRIC_PATTERNS = [
  /\b\d+\s*%/,                               // 40%, 100%
  /\b\d+(\.\d+)?\s*x\b/i,                   // 3x, 2.5x
  /\b\d[\d,]*\s*(users?|customers?|clients?|downloads?|subscribers?)\b/i,
  /\b\d[\d,]*\s*(req(uests?)?\/s|rps|tps)\b/i,
  /\b\d[\d,]*\s*(ms|seconds?|minutes?)\s*(faster|reduction|improvement|latency)\b/i,
  /\b(reduced|decreased|cut|lowered)\b.{0,40}\b\d+/i,
  /\b(increased|improved|boosted|grew|scaled)\b.{0,40}\b\d+/i,
  /\b(saved?|saving)\b.{0,40}(\$|\d+)/i,
  /\$\d[\d,.]*(k|m|b)?\b/i,                 // $500k, $1M
  /\b\d[\d,]*\s*(k|m|b)\+?\s*(revenue|saves?|sales?|transactions?)\b/i,
];

// Strong impact verbs that often precede achievements
const IMPACT_VERBS = /\b(reduced|increased|improved|optimized|accelerated|cut|eliminated|saved|generated|delivered|achieved|exceeded|surpassed|won|ranked|built|launched|shipped|led)\b/i;

// Award / recognition signals
const AWARD_PATTERNS = [
  /\b(award|recognition|winner|1st place|first place|hackathon|competition|ranked #?\d)\b/i,
  /\b(dean's list|honors?|distinction|cum laude|scholarship|fellowship)\b/i,
  /\b(best|top \d+%?|employee of|star performer)\b/i,
];

// ─── Main Analyzer ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} AchievementAnalysis
 * @property {number}   score        - 0–100
 * @property {string[]} achievements - extracted achievement snippets
 * @property {string[]} strengths
 * @property {string[]} weaknesses
 */

/**
 * Analyze the achievements across the whole resume (not just an achievements section).
 *
 * @param {{ [section: string]: string[] }} sections - all detected resume sections
 * @returns {AchievementAnalysis}
 */
function analyzeAchievements(sections) {
  // Scan ALL sections — achievements appear in Experience, Projects, and dedicated sections
  const allLines = Object.values(sections).flat().filter(l => l.trim().length > 15);
  const fullText = allLines.join('\n');

  const achievements = [];
  const strengths    = [];
  const weaknesses   = [];
  let rawScore = 0;

  // ── 1. Quantified Achievement Count (0–50) ────────────────────────────────
  const achievementLines = allLines.filter(line => {
    const hasMetric    = METRIC_PATTERNS.some(rx => rx.test(line));
    const hasImpactVrb = IMPACT_VERBS.test(line);
    return hasMetric || hasImpactVrb;
  });

  // Deduplicate and extract snippets
  for (const line of achievementLines) {
    const snippet = line.trim().slice(0, 120);
    if (!achievements.includes(snippet)) achievements.push(snippet);
  }

  const achCount = achievementLines.length;
  if (achCount >= 5) {
    rawScore += 50;
    strengths.push(`Strong — ${achCount} quantified achievement signals detected across your resume.`);
  } else if (achCount >= 3) {
    rawScore += 35;
    strengths.push(`${achCount} quantified achievements found. Aim for 5+ across your resume.`);
  } else if (achCount >= 1) {
    rawScore += 20;
    weaknesses.push(`Only ${achCount} quantified achievement(s) found. Add metrics to at least 3–5 bullets (e.g. "reduced load time by 60%", "served 10k daily users").`);
  } else {
    rawScore += 0;
    weaknesses.push('No quantified achievements detected. Every experience bullet should ideally include a measurable outcome.');
  }

  // ── 2. Metric Pattern Variety (0–25) ──────────────────────────────────────
  const metricPatternHits = METRIC_PATTERNS.filter(rx => rx.test(fullText)).length;
  const varietyScore = Math.min(25, metricPatternHits * 4);
  rawScore += varietyScore;

  if (metricPatternHits >= 4) strengths.push('Good variety of metric types (%, x multiplier, user counts, time savings).');
  else if (metricPatternHits >= 2) strengths.push('Some metric variety present.');
  else weaknesses.push('Limited metric variety. Use a mix of percentages, scale numbers, and time/cost savings.');

  // ── 3. Awards / Recognition (0–15) ────────────────────────────────────────
  const hasAwards = AWARD_PATTERNS.some(rx => rx.test(fullText));
  if (hasAwards) {
    rawScore += 15;
    strengths.push('Awards, honors, or recognition signals detected.');
  } else {
    weaknesses.push('No awards or recognition mentioned. Include hackathon wins, academic honors, or performance recognitions.');
  }

  // ── 4. Impact Verb Usage (0–10) ───────────────────────────────────────────
  const impactVerbCount = (fullText.match(/\b(reduced|increased|improved|optimized|accelerated|eliminated|saved|generated|shipped|launched)\b/gi) || []).length;
  rawScore += Math.min(10, impactVerbCount * 2);

  if (impactVerbCount >= 4) strengths.push('Strong use of impact verbs (reduced, improved, launched, etc.).');

  return {
    score:        Math.min(100, Math.max(0, rawScore)),
    achievements: achievements.slice(0, 8),
    strengths:    strengths.slice(0, 4),
    weaknesses:   weaknesses.slice(0, 4),
  };
}

module.exports = { analyzeAchievements };
