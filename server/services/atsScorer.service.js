// server/services/atsScorer.service.js
// 8-dimension holistic ATS scoring engine.
// No single category can dominate — each is capped at its defined weight.

'use strict';

const { normalizeSkillToken } = require('./normalizer.service');

// ── Dimension weights (must sum to 1.0) ───────────────────────────────────────
const WEIGHTS = {
  keywordCoverage:   0.20,
  semanticMatch:     0.20,
  experienceScore:   0.20,
  projectScore:      0.15,
  resumeQuality:     0.10,
  achievementScore:  0.05,
  educationScore:    0.05,
  formattingScore:   0.05,
};

// JD priority weight multipliers (used for weighted keyword coverage)
const PRIORITY_WEIGHTS = {
  required:    5,
  preferred:   3,
  niceToHave:  1,
  default:     2,
};

/**
 * @typedef {Object} ATSScoreResult
 * @property {number} finalATS     - 0–100 composite score
 * @property {object} breakdown    - per-dimension scores (0–100 each)
 */

/**
 * Compute the final 8-dimension ATS score.
 *
 * @param {object} params
 * @param {string[]}   params.directMatches     - canonical JD skills matched directly
 * @param {object[]}   params.semanticMatches   - { jdSkill, resumeSkill, similarity }
 * @param {string[]}   params.missing           - unmatched JD skills
 * @param {object[]}   params.jdSkills          - all extracted JD skills (ExtractedSkill[])
 * @param {object[]}   params.resumeSkills      - all extracted resume skills
 * @param {{ required: string[], preferred: string[], niceToHave: string[] }} params.jdPriority
 * @param {object}     params.experienceResult  - from experienceAnalyzer
 * @param {object}     params.projectResult     - from projectAnalyzer
 * @param {object}     params.qualityResult     - from resumeQualityAnalyzer
 * @param {object}     params.achievementResult - from achievementAnalyzer
 * @param {object}     params.educationResult   - from educationAnalyzer
 * @returns {ATSScoreResult}
 */
function computeScore({
  directMatches,
  semanticMatches,
  missing,
  jdSkills,
  resumeSkills,
  jdPriority,
  experienceResult,
  projectResult,
  qualityResult,
  achievementResult,
  educationResult,
}) {
  const totalJdSkills = jdSkills.length;

  // ── 1. Keyword Coverage (0–100) ───────────────────────────────────────────
  let keywordCoverage = 0;
  if (totalJdSkills > 0) {
    const jdWeightMap  = _buildJdWeightMap(jdSkills, jdPriority);
    const totalWeight  = _sum(Object.values(jdWeightMap));
    const directSet    = new Set(directMatches.map(s => normalizeSkillToken(s)));

    let matchedWeight = 0;
    for (const [canonical, weight] of Object.entries(jdWeightMap)) {
      if (directSet.has(normalizeSkillToken(canonical))) {
        matchedWeight += weight;
      }
    }
    keywordCoverage = totalWeight > 0 ? Math.min(100, (matchedWeight / totalWeight) * 100) : 0;
  }

  // ── 2. Semantic Match (0–100) ─────────────────────────────────────────────
  // Give 85% credit per semantic match (near-match, not exact)
  const semanticMatch = totalJdSkills > 0
    ? Math.min(100, (semanticMatches.length / totalJdSkills) * 100 * 0.85)
    : 0;

  // ── 3. Experience Score (0–100) ───────────────────────────────────────────
  const experienceScore = experienceResult?.score ?? 0;

  // ── 4. Project Score (0–100) ──────────────────────────────────────────────
  const projectScore = projectResult?.score ?? 0;

  // ── 5. Resume Quality (0–100) ─────────────────────────────────────────────
  const resumeQuality = qualityResult?.score ?? 0;

  // ── 6. Achievement Score (0–100) ──────────────────────────────────────────
  const achievementScore = achievementResult?.score ?? 0;

  // ── 7. Education Score (0–100) ────────────────────────────────────────────
  const educationScore = educationResult?.score ?? 0;

  // ── 8. Formatting Score (0–100) ───────────────────────────────────────────
  // Derived from quality analysis: contact completeness + section presence
  const formattingScore = _deriveFormattingScore(qualityResult);

  // ── Final Weighted Score ──────────────────────────────────────────────────
  const finalATS = Math.round(
    Math.min(100,
      keywordCoverage  * WEIGHTS.keywordCoverage  +
      semanticMatch    * WEIGHTS.semanticMatch     +
      experienceScore  * WEIGHTS.experienceScore   +
      projectScore     * WEIGHTS.projectScore      +
      resumeQuality    * WEIGHTS.resumeQuality     +
      achievementScore * WEIGHTS.achievementScore  +
      educationScore   * WEIGHTS.educationScore    +
      formattingScore  * WEIGHTS.formattingScore
    )
  );

  return {
    finalATS,
    breakdown: {
      keywordCoverage:   Math.round(keywordCoverage),
      semanticMatch:     Math.round(semanticMatch),
      experienceScore:   Math.round(experienceScore),
      projectScore:      Math.round(projectScore),
      resumeQuality:     Math.round(resumeQuality),
      achievementScore:  Math.round(achievementScore),
      educationScore:    Math.round(educationScore),
      formattingScore:   Math.round(formattingScore),
    },
  };
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

function _buildJdWeightMap(jdSkills, jdPriority) {
  const { required = [], preferred = [], niceToHave = [] } = jdPriority;
  const map = {};

  for (const skill of jdSkills) {
    let mult = PRIORITY_WEIGHTS.default;
    const sl = skill.canonical.toLowerCase();
    if (required.some(l => l.includes(sl)))      mult = PRIORITY_WEIGHTS.required;
    else if (preferred.some(l => l.includes(sl))) mult = PRIORITY_WEIGHTS.preferred;
    else if (niceToHave.some(l => l.includes(sl)))mult = PRIORITY_WEIGHTS.niceToHave;

    const eff = (skill.baseWeight || 1.0) * mult * (skill.sectionWeight || 1.0);
    map[skill.canonical] = (map[skill.canonical] || 0) + eff;
  }
  return map;
}

/**
 * Derive a formatting score from the quality analysis result.
 * Considers: contact completeness, section presence, word count appropriateness.
 */
function _deriveFormattingScore(qualityResult) {
  if (!qualityResult) return 50;

  const { contactLinks = {}, issues = [], wordCount = 0 } = qualityResult;

  let score = 60; // base

  // Contact completeness
  if (contactLinks.email)     score += 8;
  if (contactLinks.linkedin)  score += 8;
  if (contactLinks.github)    score += 8;
  if (contactLinks.phone)     score += 4;
  if (contactLinks.portfolio) score += 4;

  // Penalize missing essentials
  const criticalIssues = issues.filter(i =>
    i.includes('Missing essential') || i.includes('No email')
  ).length;
  score -= criticalIssues * 10;

  // Word count appropriateness
  if (wordCount >= 250 && wordCount <= 900) score += 8;
  else if (wordCount < 100) score -= 20;

  return Math.min(100, Math.max(0, score));
}

function _sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

module.exports = {
  computeScore,
  WEIGHTS,
  PRIORITY_WEIGHTS,
};
