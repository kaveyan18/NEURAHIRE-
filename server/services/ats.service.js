// server/services/ats.service.js
const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function analyzeWithATS(resumeText, jobDescription) {

  const prompt = `
You are an expert ATS (Applicant Tracking System) resume analyzer.

Analyze the following resume against the job description and return a detailed JSON response.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Respond ONLY with a valid JSON object (no markdown, no explanation, no code blocks) in this exact format:
{
  "score": <number from 0 to 100 representing ATS compatibility>,
  "matched_keywords": [<list of keywords/skills from the JD that are present in the resume>],
  "missing_keywords": [<list of important keywords/skills from the JD that are missing from the resume>],
  "suggestions": [<list of 3 to 5 specific, actionable suggestions to improve the resume for this job>],
  "summary": "<a 2-3 sentence overall assessment of the resume's fit for this role>"
}

Scoring criteria:
- Keyword match rate between resume and JD (40%)
- Relevance of experience to the role (30%)
- Skills alignment (20%)
- Education and certifications match (10%)

Return ONLY the JSON object. Do not include any other text.
`;

  const result = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
  const responseText = result.text.trim();

  // Strip markdown code fences if Gemini wraps the response
  const cleaned = responseText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('Gemini response was not valid JSON:', cleaned);
    throw new Error('Gemini returned an invalid response. Please try again.');
  }

  // Ensure required fields exist with safe defaults
  return {
    score: typeof parsed.score === 'number' ? parsed.score : 0,
    matched_keywords: Array.isArray(parsed.matched_keywords) ? parsed.matched_keywords : [],
    missing_keywords: Array.isArray(parsed.missing_keywords) ? parsed.missing_keywords : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
  };
}

module.exports = { analyzeWithATS };