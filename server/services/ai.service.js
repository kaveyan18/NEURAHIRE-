const openai = require('../config/openai');

const SYSTEM_PROMPT = `You are an expert hiring manager and resume coach. Analyse the given resume against the job description and return ONLY a valid JSON object with no markdown, no explanation, no code blocks. The JSON must have exactly these fields:
- score: a number from 0 to 100 representing how well the resume matches the job description
- matched_keywords: an array of strings — keywords from the job description that appear in the resume
- missing_keywords: an array of strings — important keywords from the job description that are missing from the resume
- suggestions: an array of exactly 3 strings — specific, actionable suggestions to improve the resume for this job`;

const analyzeResume = async (resumeText, jobDescription) => {
  console.log("Sending request to OpenAI (gpt-4o-mini)...");
  
  const userPrompt = `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nPlease perform the analysis and return ONLY the required JSON.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ]
  });

  let aiResponse = completion.choices[0].message.content;
  console.log("Received response from OpenAI.");

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
