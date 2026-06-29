// server/services/suggestionEngine.service.js
// Generates WHY-based, actionable suggestions from all section analysis results.
// Every suggestion explains exactly which dimension lost points and how to fix it.

'use strict';

const { normalizeSkillToken } = require('./normalizer.service');

/**
 * Build up to 8 specific, WHY-based ATS improvement suggestions.
 *
 * @param {object} params
 * @param {string[]}   params.missingSkills      - canonical JD skills not found
 * @param {object[]}   params.semanticMatches    - { jdSkill, resumeSkill, similarity }
 * @param {object[]}   params.jdSkills           - all JD skills
 * @param {{ required: string[], preferred: string[], niceToHave: string[] }} params.jdPriority
 * @param {object}     params.experienceResult   - from experienceAnalyzer
 * @param {object}     params.projectResult      - from projectAnalyzer
 * @param {object}     params.qualityResult      - from resumeQualityAnalyzer
 * @param {object}     params.achievementResult  - from achievementAnalyzer
 * @param {object}     params.educationResult    - from educationAnalyzer
 * @param {object}     params.score              - { finalATS, breakdown }
 * @returns {string[]}
 */
function buildSuggestions({
  missingSkills,
  semanticMatches,
  jdSkills,
  jdPriority,
  experienceResult,
  projectResult,
  qualityResult,
  achievementResult,
  educationResult,
  score,
}) {
  const suggestions = [];
  const { required = [], preferred = [] } = jdPriority;
  const breakdown = score?.breakdown || {};

  // ── Priority 1: Critical missing skills (required by JD) ──────────────────
  const requiredMissing = missingSkills.filter(skill =>
    required.some(line => line.includes(skill.toLowerCase()))
  );
  for (const skill of requiredMissing.slice(0, 2)) {
    suggestions.push(
      `🚨 Add "${skill}" to your resume — it is listed as a **required skill** in the JD. Without it, ATS systems will likely filter your resume out automatically.`
    );
  }

  // ── Priority 2: Experience dimension is weak ───────────────────────────────
  if (breakdown.experienceScore < 45) {
    const expWeaknesses = experienceResult?.weaknesses || [];
    if (expWeaknesses.length > 0) {
      suggestions.push(`📋 Experience (scored ${breakdown.experienceScore}/100): ${expWeaknesses[0]}`);
    } else {
      suggestions.push(`📋 Experience scored ${breakdown.experienceScore}/100. Add more quantified bullets with action verbs (Developed, Optimized, Reduced) and measurable outcomes.`);
    }
  }

  // ── Priority 3: Project dimension is weak ─────────────────────────────────
  if (breakdown.projectScore < 45) {
    const projWeaknesses = projectResult?.weaknesses || [];
    if (projWeaknesses.length > 0) {
      suggestions.push(`🚀 Projects (scored ${breakdown.projectScore}/100): ${projWeaknesses[0]}`);
    } else {
      suggestions.push(`🚀 Projects scored ${breakdown.projectScore}/100. Include deployed, full-stack projects with clear tech stacks, live URLs, and scale info.`);
    }
  }

  // ── Priority 4: Achievement score is weak ─────────────────────────────────
  if (breakdown.achievementScore < 40) {
    suggestions.push(
      `📊 Achievements (scored ${breakdown.achievementScore}/100): ` +
      (achievementResult?.weaknesses[0] || 'Add at least 3 bullets with quantified outcomes (e.g. "reduced API latency by 40%", "served 10k daily active users").')
    );
  }

  // ── Priority 5: Semantic near-match tip ───────────────────────────────────
  if (semanticMatches.length > 0) {
    const m = semanticMatches[0];
    suggestions.push(
      `🔄 Your resume mentions "${m.resumeSkill}" which semantically matches "${m.jdSkill}" in the JD (${Math.round(m.similarity * 100)}% similarity). Use the JD's exact term "${m.jdSkill}" for stronger ATS keyword matching.`
    );
  }

  // ── Priority 6: Quality / formatting issues ────────────────────────────────
  if (breakdown.resumeQuality < 60 || breakdown.formattingScore < 60) {
    const qualIssues = qualityResult?.issues || [];
    const criticalIssue = qualIssues.find(i =>
      i.includes('LinkedIn') || i.includes('GitHub') || i.includes('summary') || i.includes('weak phrases')
    );
    if (criticalIssue) {
      suggestions.push(`✅ Quality (scored ${breakdown.resumeQuality}/100): ${criticalIssue}`);
    }
  }

  // ── Priority 7: General missing skills ────────────────────────────────────
  const generalMissing = missingSkills.filter(s =>
    !requiredMissing.includes(s) &&
    !preferred.some(l => l.includes(s.toLowerCase()))
  );
  for (const skill of generalMissing.slice(0, 2)) {
    if (suggestions.length >= 7) break;
    suggestions.push(
      `📌 Add "${skill}" — mentioned in the JD but not detected in your resume. Include it in Skills and demonstrate it in an Experience or Projects bullet.`
    );
  }

  // ── Priority 8: Preferred missing skills ──────────────────────────────────
  const preferredMissing = missingSkills.filter(skill =>
    preferred.some(line => line.includes(skill.toLowerCase())) &&
    !requiredMissing.includes(skill)
  );
  for (const skill of preferredMissing.slice(0, 1)) {
    if (suggestions.length >= 8) break;
    suggestions.push(
      `⭐ "${skill}" is listed as a preferred skill in the JD. Adding it to your Skills section would boost your match score.`
    );
  }

  // ── Fill remaining slots with high-value best practices ───────────────────
  const bestPractices = [
    `📄 Use a single-column, ATS-friendly PDF format — multi-column layouts and tables can cause ATS parsers to miss your skills entirely.`,
    `🔢 Quantify every Experience bullet with numbers, percentages, or scale (e.g. "reduced build time by 60%", "handled 10k daily API requests").`,
    `🎯 Mirror the exact job title from the posting in your Professional Summary to signal strong role alignment.`,
    `🏷️ Add a "Tech Stack" line to each job entry listing every tool used in that specific role — this maximizes keyword surface area for ATS.`,
    `🔗 Add a live URL or GitHub link to every project — ATS systems and recruiters both verify project authenticity.`,
  ];

  let bpIdx = 0;
  while (suggestions.length < 6 && bpIdx < bestPractices.length) {
    suggestions.push(bestPractices[bpIdx++]);
  }

  return suggestions.slice(0, 8);
}

module.exports = { buildSuggestions };
