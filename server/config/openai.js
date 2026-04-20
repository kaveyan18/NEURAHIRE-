const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'default_dummy_key_to_prevent_startup_crash',
});

module.exports = openai;
