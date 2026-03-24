const pdf = require('pdf-parse');

const extractTextFromPDF = async (buffer) => {
  try {
    console.log("Parsing PDF file...");
    const data = await pdf(buffer);
    console.log(`PDF parsed successfully. Extracted text length: ${data.text.length} characters`);
    return data.text;
  } catch (error) {
    console.error("Failed to parse PDF:", error);
    throw new Error("Failed to parse PDF");
  }
};

module.exports = {
  extractTextFromPDF,
};
