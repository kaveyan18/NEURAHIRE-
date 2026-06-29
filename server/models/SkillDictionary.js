// server/models/SkillDictionary.js
const mongoose = require('mongoose');

/**
 * @typedef {Object} SkillEntry
 * @property {string}   canonical  - The single canonical form of the skill (e.g. "node.js")
 * @property {string[]} aliases    - All known spellings / abbreviations
 * @property {string}   category   - One of: language, frontend, backend, database, cloud, devops, concept, data, security, testing, other
 * @property {number}   weight     - Base importance multiplier (1.0 = normal, 1.5 = high-value)
 * @property {string[]} tags       - Optional descriptive tags for grouping
 */

const skillDictionarySchema = new mongoose.Schema({
  canonical: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  aliases: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    required: true,
    enum: ['language', 'frontend', 'backend', 'database', 'cloud', 'devops', 'concept', 'data', 'security', 'testing', 'tool', 'other'],
  },
  weight: {
    type: Number,
    default: 1.0,
  },
  tags: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

// Index aliases for fast lookup
skillDictionarySchema.index({ aliases: 1 });
skillDictionarySchema.index({ category: 1 });

module.exports = mongoose.model('SkillDictionary', skillDictionarySchema);
