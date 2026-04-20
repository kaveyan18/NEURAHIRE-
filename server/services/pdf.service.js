const { PDFParse, VerbosityLevel } = require('pdf-parse');

const extractTextFromPDF = async (buffer) => {
  let parser;
  try {
    console.log("Parsing PDF file, size:", buffer.length, "bytes");
    parser = new PDFParse({
      data: buffer,
      verbosity: VerbosityLevel.ERRORS, // suppress warnings
    });
    const result = await parser.getText();
    const text = result?.text ?? '';
    console.log(`PDF parsed successfully. Text length: ${text.length} characters`);
    if (!text.trim()) {
      throw new Error("PDF appears to contain no extractable text. It may be a scanned image-based PDF.");
    }
    return text;
  } catch (error) {
    console.error("Failed to parse PDF:", error.message);
    throw new Error(error.message || "Failed to parse PDF");
  } finally {
    if (parser) {
      try { await parser.destroy(); } catch {}
    }
  }
};

module.exports = { extractTextFromPDF };
