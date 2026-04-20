const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are an expert hiring manager and resume coach. Analyse the given resume against the job description and return ONLY a valid JSON object with no markdown, no explanation, no code blocks. The JSON must have exactly these fields:
- score: a number from 0 to 100 representing how well the resume matches the job description
- matched_keywords: an array of strings — keywords from the job description that appear in the resume
- missing_keywords: an array of strings — important keywords from the job description that are missing from the resume
- suggestions: an array of exactly 3 strings — specific, actionable suggestions to improve the resume for this job`;

const analyzeResume = async (resumeText, jobDescription) => {
  console.log("Sending request to Gemini (gemini-2.5-flash)...");
  
  const userPrompt = `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nPlease perform the analysis and return ONLY the required JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json"
    }
  });

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
