const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const app = require('./app');
const { getEmbedder } = require('./services/embedder');

const port = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start the server
app.listen(port, () => {
  console.log(`Server is running gracefully on http://localhost:${port}`);
  // Warm up the embedding model in the background so the first real
  // user request isn't delayed by a cold-start model load (~3-5 s).
  getEmbedder().catch(err => console.warn('[Embedder] Warmup failed:', err));
});
