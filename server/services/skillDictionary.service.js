// server/services/skillDictionary.service.js
// Singleton that seeds the MongoDB SkillDictionary collection on first boot,
// then loads all skills into an in-memory Map for zero-latency lookups.

'use strict';

const SkillDictionary = require('../models/SkillDictionary');
const SKILLS_SEED     = require('../data/skills.seed');
const { normalizeSkillToken } = require('./normalizer.service');

// ─── In-memory store ─────────────────────────────────────────────────────────
// Key: normalized alias string → Value: SkillEntry
/** @type {Map<string, object>} */
let _aliasMap  = new Map();   // alias (normalized) → skill entry
/** @type {Map<string, object>} */
let _canonicalMap = new Map(); // canonical (normalized) → skill entry
let _loaded = false;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Seed MongoDB if the collection is empty, then load all skills into memory.
 * Call once at server startup after mongoose.connect().
 */
async function loadOrSeed() {
  try {
    const count = await SkillDictionary.countDocuments();
    if (count === 0) {
      console.log('[SkillDictionary] Collection empty — seeding...');
      await _seedDatabase();
    } else {
      console.log(`[SkillDictionary] Found ${count} existing skills in DB.`);
    }
    await _loadIntoMemory();
    console.log(`[SkillDictionary] Loaded ${_aliasMap.size} alias entries (${_canonicalMap.size} canonical skills) into memory.`);
  } catch (err) {
    console.error('[SkillDictionary] Failed to load/seed — falling back to alias-table-only mode:', err.message);
  }
}

/**
 * Look up a normalized token/phrase in the in-memory alias map.
 * @param {string} token - should already be normalized (lowercase, alias-expanded)
 * @returns {object|null} SkillEntry or null
 */
function lookupSkill(token) {
  if (!token) return null;
  const key = normalizeSkillToken(token);
  return _aliasMap.get(key) || _canonicalMap.get(key) || null;
}

/**
 * Returns all loaded canonical skills.
 * @returns {object[]}
 */
function getAllSkills() {
  return Array.from(_canonicalMap.values());
}

/**
 * Returns the number of canonical skills currently loaded.
 * @returns {number}
 */
function getDictionarySize() {
  return _canonicalMap.size;
}

/**
 * Returns true if the dictionary has been loaded into memory.
 * @returns {boolean}
 */
function isReady() {
  return _loaded;
}

// ─── Private helpers ──────────────────────────────────────────────────────────

async function _seedDatabase() {
  const BATCH = 200;
  for (let i = 0; i < SKILLS_SEED.length; i += BATCH) {
    const batch = SKILLS_SEED.slice(i, i + BATCH);
    await SkillDictionary.insertMany(batch, { ordered: false }).catch(err => {
      // Ignore duplicate key errors (E11000) — they just mean some entries are already present
      if (err.code !== 11000 && (!err.writeErrors || err.writeErrors.some(e => e.code !== 11000))) {
        console.warn('[SkillDictionary] Batch insert warning:', err.message);
      }
    });
  }
  console.log(`[SkillDictionary] Seeded ${SKILLS_SEED.length} skills into MongoDB.`);
}

async function _loadIntoMemory() {
  const skills = await SkillDictionary.find({}).lean();
  _aliasMap    = new Map();
  _canonicalMap = new Map();

  for (const skill of skills) {
    const canonicalKey = normalizeSkillToken(skill.canonical);
    _canonicalMap.set(canonicalKey, skill);

    // Index by canonical itself
    _aliasMap.set(canonicalKey, skill);

    // Index by every alias
    for (const alias of (skill.aliases || [])) {
      const aliasKey = normalizeSkillToken(alias);
      if (aliasKey) _aliasMap.set(aliasKey, skill);
    }
  }

  _loaded = true;
}

module.exports = {
  loadOrSeed,
  lookupSkill,
  getAllSkills,
  getDictionarySize,
  isReady,
};
