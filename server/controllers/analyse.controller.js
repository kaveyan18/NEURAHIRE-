const pdfService = require('../services/pdf.service');
const aiService = require('../services/ai.service');

const analyzeResumeController = async (req, res) => {
  console.log("Received request at /api/analyse");

  try {
    // Check if the resume file was provided
    if (!req.file) {
      console.log("Error: No resume file uploaded");
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    const jobDescription = req.body.jobDescription || "";
    console.log(`Received job description, length: ${jobDescription.length} characters`);

    // Parse the PDF
    let resumeText;
    try {
      resumeText = await pdfService.extractTextFromPDF(req.file.buffer);
    } catch (parseError) {
      return res.status(500).json({ error: "Failed to parse PDF" });
    }

    // Call AI service
    const parsedJson = await aiService.analyzeResume(resumeText, jobDescription);
    console.log("Parsed JSON successfully.");

    // Return the parsed JSON
    return res.status(200).json(parsedJson);

  } catch (error) {
    console.error("AI analysis failed or error occurred:", error);
    return res.status(500).json({ error: "AI analysis failed", details: error.message });
  }
};

module.exports = {
  analyzeResumeController,
};
