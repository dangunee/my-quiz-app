/**
 * Reads PDF, extracts Japanese sentences for quizzes 1-90,
 * and updates quiz-data.ts where japanese is empty.
 * Run: node scripts/update-japanese-from-pdf.js
 */

const fs = require("fs");
const path = require("path");

const pdfPath = "/Users/dangunee/Library/Application Support/Cursor/User/workspaceStorage/1772126497415/pdfs/55f5cf3c-10a0-47c0-a9e4-aad3174ab160/퀴즈로 배우는 한국어 1-90 for X 수정 완료.pdf";
const txtPath = path.join(__dirname, "pdf-extracted.txt");
const quizDataPath = path.join(__dirname, "../app/quiz-data.ts");

async function main() {
  let content = "";
  if (fs.existsSync(pdfPath)) {
    try {
      const pdfParse = require("pdf-parse");
      const dataBuffer = fs.readFileSync(pdfPath);
      const data = await pdfParse(dataBuffer);
      content = data.text;
    } catch (e) {
      console.error("pdf-parse failed:", e.message);
    }
  }
  if (!content && fs.existsSync(txtPath)) {
    content = fs.readFileSync(txtPath, "utf-8");
  }
  if (!content) {
    console.error("No PDF or pdf-extracted.txt found. Run: npm install pdf-parse && node scripts/extract-pdf.js");
    process.exit(1);
  }

  // Parse blocks: 【クイズで学ぶ韓国語N】 or 【クイズで学ぶ韓国語 N】... Japanese lines (before Korean)
  const blocks = content.split(/【クイズで学ぶ韓国語\s*(\d+)】/);
  const japaneseById = {};

  for (let i = 1; i + 1 < blocks.length; i += 2) {
    const num = parseInt(blocks[i], 10);
    const block = blocks[i + 1] || "";
    if (num < 1 || num > 90) continue;

    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const japaneseLines = [];

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      if (line.startsWith("【正解】") || line === "[解説]") break;
      if (line.match(/^[❶❷❸❹①②③④]/)) break;
      if (line.match(/^[A-D]\.\s*[❶❷❸❹]?/)) break;

      // Korean line (has 한글, before we see options)
      if (line.match(/[가-힣]/) && !line.match(/[\u3040-\u309F\u4E00-\u9FFF]/)) break;

      // Japanese: hiragana/kanji
      if (
        line.match(/[\u3040-\u309F\u4E00-\u9FFF]/) &&
        !line.includes("次の文を韓国語にすると一番自然なのはどれでしょうか")
      ) {
        japaneseLines.push(line);
      }
    }

    const japanese = japaneseLines.join("").replace(/\s+/g, "").trim();
    if (japanese) japaneseById[num] = japanese;
  }

  console.log("Extracted Japanese for", Object.keys(japaneseById).length, "quizzes");

  let quizData = fs.readFileSync(quizDataPath, "utf-8");
  const lines = quizData.split("\n");
  const newLines = [];
  let currentId = null;
  let replaced = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const idMatch = line.match(/id:\s*(\d+)/);
    if (idMatch) currentId = parseInt(idMatch[1], 10);

    if (currentId && currentId >= 1 && currentId <= 90 && /japanese:\s*""/.test(line)) {
      const jap = japaneseById[currentId];
      if (jap) {
        line = line.replace(/japanese:\s*""/, `japanese: ${JSON.stringify(jap)}`);
        replaced++;
      }
    }
    newLines.push(line);
  }

  fs.writeFileSync(quizDataPath, newLines.join("\n"));
  console.log("Updated", replaced, "quizzes with Japanese from PDF");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
