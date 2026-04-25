const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are an expert hiring manager and resume coach. Analyse the given resume against the job description and return ONLY a valid JSON object with no markdown, no explanation, no code blocks. The JSON must have exactly these fields:
- score: a number from 0 to 100 representing how well the resume matches the job description
- matched_keywords: an array of strings — keywords from the job description that appear in the resume
- missing_keywords: an array of strings — important keywords from the job description that are missing from the resume
- suggestions: an array of exactly 3 strings — specific, actionable suggestions to improve the resume for this job`;

// Retry helper — retries on 503/UNAVAILABLE with exponential backoff
const withRetry = async (fn, maxRetries = 3, delayMs = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isUnavailable =
        err?.status === 503 ||
        err?.message?.includes('503') ||
        err?.message?.toLowerCase().includes('unavailable') ||
        err?.message?.toLowerCase().includes('high demand');

      if (isUnavailable && attempt < maxRetries) {
        console.warn(`Gemini 503 — retrying (${attempt}/${maxRetries}) after ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // exponential backoff: 1s → 2s → 4s
      } else {
        // Not retryable, or out of retries — re-throw with clear message
        if (isUnavailable) {
          const overloadErr = new Error('Gemini AI is currently experiencing high demand. Please try again in a few seconds.');
          overloadErr.isOverloaded = true;
          throw overloadErr;
        }
        throw err;
      }
    }
  }
};

const analyzeResume = async (resumeText, jobDescription) => {
  console.log("Sending request to Gemini (gemini-flash-latest)...");

  const userPrompt = `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nPlease perform the analysis and return ONLY the required JSON.`;

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json"
      }
    })
  );

  let aiResponse = response.text;
  console.log("Received response from Gemini.");

  // Clean up JSON: strip leading/trailing whitespace, ```json, and ```
  aiResponse = aiResponse.trim();
  if (aiResponse.startsWith("```")) {
    aiResponse = aiResponse.replace(/^```(?:json|JSON)?\s*/, "");
    aiResponse = aiResponse.replace(/\s*```$/, "");
  }
  aiResponse = aiResponse.trim();

  console.log("Attempting to parse AI response JSON...");
  return JSON.parse(aiResponse);
};

module.exports = {
  analyzeResume,
};
