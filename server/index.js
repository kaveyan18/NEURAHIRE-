const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const app = require('./app');
const { getEmbedder }  = require('./services/embedder');
const skillDictionary  = require('./services/skillDictionary.service');

const port = process.env.PORT || 3001;

// Connect to MongoDB then boot background services
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Start the server first so health-check routes respond immediately
    app.listen(port, () => {
      console.log(`Server is running gracefully on http://localhost:${port}`);

      // Warm up in parallel — neither blocks request handling
      Promise.all([
        // 1. Seed + load skill dictionary (runs once, then stays in memory)
        skillDictionary.loadOrSeed().catch(err =>
          console.warn('[SkillDictionary] Startup warning:', err.message)
        ),
        // 2. Load embedding model (~3-5 s cold start)
        getEmbedder().catch(err =>
          console.warn('[Embedder] Warmup failed:', err)
        ),
      ]);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
