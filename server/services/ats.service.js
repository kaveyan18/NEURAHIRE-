// server/services/ats.service.js
// Holistic ATS pipeline orchestrator — v2.
// Runs all section analyzers in parallel, then feeds results into the
// 8-dimension scorer and WHY-based suggestion engine.
//
// Pipeline:
//   1. Normalize text
//   2. Detect sections
//   3. Extract skills (JD + resume) + run 5 section analyzers IN PARALLEL
//   4. Semantic match
//   5. 8-dimension score computation
//   6. WHY-based suggestion generation
//   7. Return enriched response

'use strict';

const { normalizeText }               = require('./normalizer.service');
const { detectSections, detectJDPriority, getSectionWeightedChunks } = require('./sectionDetector.service');
const { extractSkillsFromSections }   = require('./skillExtractor.service');
const { semanticMatch }               = require('./semanticMatcher.service');
const { computeScore }                = require('./atsScorer.service');
const { buildSuggestions }            = require('./suggestionEngine.service');
const { analyzeExperience }           = require('./experienceAnalyzer.service');
const { analyzeProjects }             = require('./projectAnalyzer.service');
const { analyzeResumeQuality }        = require('./resumeQualityAnalyzer.service');
const { analyzeAchievements }         = require('./achievementAnalyzer.service');
const { analyzeEducation }            = require('./educationAnalyzer.service');
const { isEmbedderReady, embedderFailed } = require('./embedder');
const { getDictionarySize }           = require('./skillDictionary.service');

const MAX_RESUME_CHARS = 20000;
const MAX_JD_CHARS     = 10000;
const SEMANTIC_THRESHOLD = parseFloat(process.env.SEMANTIC_THRESHOLD || '0.80');

/**
 * Full holistic ATS analysis.
 *
 * @param {string} resumeText     - raw text from PDF
 * @param {string} jobDescription - raw JD text
 * @returns {Promise<object>}     - enriched ATS result
 */
async function analyzeWithATS(resumeText, jobDescription) {
  if (!resumeText?.trim() || !jobDescription?.trim()) {
    throw new ATSError('Resume text and job description are both required.', 400);
  }

  // ── Step 1: Normalize ─────────────────────────────────────────────────────
  const resume = normalizeText(resumeText).slice(0, MAX_RESUME_CHARS);
  const jd     = normalizeText(jobDescription).slice(0, MAX_JD_CHARS);

  // ── Step 2: Detect sections ───────────────────────────────────────────────
  const resumeSections = detectSections(resume);
  const jdSections     = detectSections(jd);

  // ── Step 3: Skill extraction + section analysis (parallel) ────────────────
  const resumeChunks = getSectionWeightedChunks(resumeSections);
  const jdChunks     = getSectionWeightedChunks(jdSections);

  const [
    resumeSkills,
    jdSkills,
    experienceResult,
    projectResult,
    qualityResult,
    achievementResult,
    educationResult,
  ] = await Promise.all([
    Promise.resolve(extractSkillsFromSections(resumeChunks)),
    Promise.resolve(extractSkillsFromSections(jdChunks)),
    Promise.resolve(analyzeExperience(resumeSections)),
    Promise.resolve(analyzeProjects(resumeSections)),
    Promise.resolve(analyzeResumeQuality(resumeSections)),
    Promise.resolve(analyzeAchievements(resumeSections)),
    Promise.resolve(analyzeEducation(resumeSections)),
  ]);

  if (jdSkills.length === 0) {
    return _emptyResult(
      'No technical skills were detected in the job description. Ensure the JD contains explicit technology names or skill requirements.',
      { experienceResult, projectResult, qualityResult, achievementResult, educationResult }
    );
  }

  // ── Step 4: JD priority signals ───────────────────────────────────────────
  const jdPriority = detectJDPriority(jd);

  // ── Step 5: Semantic matching ─────────────────────────────────────────────
  const { directMatches, semanticMatches, missing } = await semanticMatch(
    resumeSkills,
    jdSkills,
    SEMANTIC_THRESHOLD
  );

  // ── Step 6: 8-dimension score ─────────────────────────────────────────────
  const score = computeScore({
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
  });

  // ── Step 7: WHY-based suggestions ─────────────────────────────────────────
  const suggestions = buildSuggestions({
    missingSkills:    missing,
    semanticMatches,
    jdSkills,
    jdPriority,
    experienceResult,
    projectResult,
    qualityResult,
    achievementResult,
    educationResult,
    score,
  });

  // ── Step 8: Assemble strengths / weaknesses summary ───────────────────────
  const resumeStrengths  = _collectStrengths({ experienceResult, projectResult, qualityResult, achievementResult, educationResult });
  const resumeWeaknesses = _collectWeaknesses({ experienceResult, projectResult, qualityResult, achievementResult, educationResult });

  // ── Step 9: Return enriched response ──────────────────────────────────────
  return {
    // Core skill match (unchanged field names for client compatibility)
    matchedSkills:   directMatches.slice(0, 30),
    missingSkills:   missing.slice(0, 20),
    semanticMatches: semanticMatches.slice(0, 15).map(m => ({
      jdSkill:     m.jdSkill,
      resumeSkill: m.resumeSkill,
      similarity:  m.similarity,
    })),

    // Score — finalATS + full breakdown
    score,

    // Section-level analysis
    sectionScores: {
      experience:  { score: experienceResult.score,  strengths: experienceResult.strengths,  weaknesses: experienceResult.weaknesses },
      projects:    { score: projectResult.score,     strengths: projectResult.strengths,     weaknesses: projectResult.weaknesses },
      quality:     { score: qualityResult.score,     issues:    qualityResult.issues,        strengths:  qualityResult.strengths, wordCount: qualityResult.wordCount },
      achievements:{ score: achievementResult.score, achievements: achievementResult.achievements, strengths: achievementResult.strengths, weaknesses: achievementResult.weaknesses },
      education:   { score: educationResult.score,   degreeLevel: educationResult.degreeLevel, relevant: educationResult.relevant, strengths: educationResult.strengths, weaknesses: educationResult.weaknesses },
    },

    // Top-level narrative
    resumeStrengths:  resumeStrengths.slice(0, 5),
    resumeWeaknesses: resumeWeaknesses.slice(0, 5),
    suggestions,

    // Debug / meta
    meta: {
      semantic_layer_used:   isEmbedderReady(),
      semantic_layer_failed: embedderFailed(),
      skills_db_size:        getDictionarySize(),
      resume_skills_found:   resumeSkills.length,
      jd_skills_found:       jdSkills.length,
      threshold:             SEMANTIC_THRESHOLD,
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _collectStrengths({ experienceResult, projectResult, qualityResult, achievementResult, educationResult }) {
  return [
    ...(experienceResult?.strengths  || []),
    ...(projectResult?.strengths     || []),
    ...(qualityResult?.strengths     || []),
    ...(achievementResult?.strengths || []),
    ...(educationResult?.strengths   || []),
  ].filter(Boolean);
}

function _collectWeaknesses({ experienceResult, projectResult, qualityResult, achievementResult, educationResult }) {
  return [
    ...(experienceResult?.weaknesses  || []),
    ...(projectResult?.weaknesses     || []),
    ...(qualityResult?.issues         || []),
    ...(achievementResult?.weaknesses || []),
    ...(educationResult?.weaknesses   || []),
  ].filter(Boolean);
}

function _emptyResult(message, sectionResults = {}) {
  const { experienceResult, projectResult, qualityResult, achievementResult, educationResult } = sectionResults;
  return {
    matchedSkills:   [],
    missingSkills:   [],
    semanticMatches: [],
    score: {
      finalATS: 0,
      breakdown: {
        keywordCoverage: 0, semanticMatch: 0,
        experienceScore: experienceResult?.score ?? 0,
        projectScore:    projectResult?.score    ?? 0,
        resumeQuality:   qualityResult?.score    ?? 0,
        achievementScore:achievementResult?.score?? 0,
        educationScore:  educationResult?.score  ?? 0,
        formattingScore: 0,
      },
    },
    sectionScores: {
      experience:  experienceResult  || { score: 0, strengths: [], weaknesses: [] },
      projects:    projectResult     || { score: 0, strengths: [], weaknesses: [] },
      quality:     qualityResult     || { score: 0, issues: [], strengths: [] },
      achievements:achievementResult || { score: 0, achievements: [], strengths: [], weaknesses: [] },
      education:   educationResult   || { score: 0, degreeLevel: 'none', relevant: false, strengths: [], weaknesses: [] },
    },
    resumeStrengths:  [],
    resumeWeaknesses: [],
    suggestions: [message],
    meta: {
      semantic_layer_used:   isEmbedderReady(),
      semantic_layer_failed: embedderFailed(),
      skills_db_size:        getDictionarySize(),
      resume_skills_found:   0,
      jd_skills_found:       0,
      threshold:             SEMANTIC_THRESHOLD,
    },
  };
}

class ATSError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ATSError';
  }
}

module.exports = { analyzeWithATS, ATSError };