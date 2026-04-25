const mongoose = require('mongoose');

const analysisCacheSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true
  },
  result: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AnalysisCache', analysisCacheSchema);
