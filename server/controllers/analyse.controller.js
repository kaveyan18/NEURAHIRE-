const crypto = require('crypto');
const pdfService = require('../services/pdf.service');
const aiService = require('../services/ai.service');
const User = require('../models/User');
const AnalysisCache = require('../models/AnalysisCache');

const analyzeResumeController = async (req, res) => {
  console.log("Received request at /api/analyse");

  try {
    if (!req.file) {
      console.log("Error: No resume file uploaded");
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    const jobDescription = req.body.jobDescription || "";
    if (!jobDescription.trim()) {
      return res.status(400).json({ error: "Job description is required" });
    }

    console.log(`File: ${req.file.originalname} (${req.file.size} bytes)`);
    console.log(`Job description length: ${jobDescription.length} characters`);

    // User Limit Check
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }
    if (user.credits < 1) {
      return res.status(403).json({ 
        error: "Insufficient credits", 
        message: "You have run out of credits. Please purchase more to continue analysing resumes." 
      });
    }

    // Parse the PDF
    let resumeText;
    try {
      resumeText = await pdfService.extractTextFromPDF(req.file.buffer);
    } catch (parseError) {
      console.error("PDF parse error:", parseError.message);
      return res.status(422).json({
        error: "Could not read your PDF. Please make sure it is a valid, non-password-protected PDF file.",
      });
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(422).json({
        error: "Your PDF appears to be empty or contains only images. Please upload a text-based PDF resume.",
      });
    }

    // Cache Check
    const hashData = resumeText + jobDescription;
    const hash = crypto.createHash('sha256').update(hashData).digest('hex');

    const cachedAnalysis = await AnalysisCache.findOne({ hash });
    if (cachedAnalysis) {
      console.log("Cache hit! Returning cached analysis result.");
      user.credits -= 1;
      await user.save();
      return res.status(200).json(cachedAnalysis.result);
    }

    // Call Gemini AI
    let parsedJson;
    try {
      parsedJson = await aiService.analyzeResume(resumeText, jobDescription);
    } catch (aiError) {
      console.error("AI service error:", aiError.message);
      return res.status(502).json({
        error: "AI analysis failed. Please try again in a moment.",
        details: aiError.message,
      });
    }

    // Save to Cache & Update User Count
    await AnalysisCache.create({ hash, result: parsedJson });
    user.credits -= 1;
    await user.save();

    console.log("Analysis complete. Score:", parsedJson?.score);
    return res.status(200).json(parsedJson);

  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
};

module.exports = { analyzeResumeController };
