#!/usr/bin/env node
/**
 * Extracts text from the quiz PDF and writes to pdf-extracted.txt
 * Run: npm install pdf-parse && node scripts/extract-pdf.js
 */
const fs = require("fs");
const path = require("path");

const pdfPath = path.join(
  process.env.HOME || "",
  "Library/Application Support/Cursor/User/workspaceStorage/1772028049801/pdfs/f0f774fc-4ebd-4533-a6fe-4597aef0c48a/퀴즈로 배우는 한국어 1-90 for X 수정 완료.pdf"
);

const outPath = path.join(__dirname, "pdf-extracted.txt");

async function main() {
  let pdfParse;
  try {
    pdfParse = require("pdf-parse");
  } catch (e) {
    console.error("Run: npm install pdf-parse --save-dev");
    process.exit(1);
  }

  if (!fs.existsSync(pdfPath)) {
    console.error("PDF not found:", pdfPath);
    process.exit(1);
  }

  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  fs.writeFileSync(outPath, data.text, "utf-8");
  console.log("Extracted", data.numpages, "pages to", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
