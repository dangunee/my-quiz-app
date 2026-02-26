const fs = require("fs");
const path = require("path");

const pdfPath = path.join(
  process.env.HOME || "",
  "Library/Application Support/Cursor/User/workspaceStorage/1772028049801/pdfs/f0f774fc-4ebd-4533-a6fe-4597aef0c48a/퀴즈로 배우는 한국어 1-90 for X 수정 완료.pdf"
);

// Read extracted text (we'll pass content via stdin or file)
const pdfTextPath = path.join(__dirname, "pdf-extracted.txt");
let content = "";
if (fs.existsSync(pdfTextPath)) {
  content = fs.readFileSync(pdfTextPath, "utf-8");
} else {
  console.error("Create pdf-extracted.txt with PDF text content first");
  process.exit(1);
}

const BLANK = "_________________________";
const QUESTION = "次の文を韓国語にすると一番自然なのはどれでしょうか。";

function parseCorrect(s) {
  const m = s.match(/【正解】[❶❷❸❹①②③④]|【正解】([A-D])/);
  if (!m) return 1;
  const c = m[0].slice(-1);
  if (c === "A" || c === "①" || c === "❶") return 1;
  if (c === "B" || c === "②" || c === "❷") return 2;
  if (c === "C" || c === "③" || c === "❸") return 3;
  if (c === "D" || c === "④" || c === "❹") return 4;
  return 1;
}

function stripOption(s) {
  return (s || "")
    .replace(/^[❶❷❸❹①②③④]\s*/, "")
    .replace(/\s*\d+\.\d+%\s*$/, "")
    .trim();
}

// Split gives: [prefix, num1, content1, num2, content2, ...] - num at odd index, content at even
const quizBlocks = content.split(/【クイズで学ぶ韓国語(\d+)】/);
const quizzes = [];

for (let i = 1; i + 1 < quizBlocks.length; i += 2) {
  const numStr = quizBlocks[i];
  const block = quizBlocks[i + 1] || "";
  const num = parseInt(numStr, 10);
  if (isNaN(num) || num < 1 || num > 90) continue;

  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

  let japanese = "";
  const koreanTemplateLines = [];
  const options = [];
  let correctAnswer = 1;
  let explanation = "";

  let state = "header";
  let explLines = [];
  const japaneseLines = [];

  for (let j = 0; j < lines.length; j++) {
    const line = lines[j];

    if (line.startsWith("【正解】")) {
      correctAnswer = parseCorrect(line);
      state = "explanation";
      continue;
    }
    if (line === "[解説]") {
      state = "explanation";
      continue;
    }
    if (state === "explanation") {
      explLines.push(line);
      continue;
    }

    const optMatch = line.match(/^[❶❷❸❹①②③④](.+)$/);
    if (optMatch) {
      options.push(stripOption(line));
      continue;
    }

    const abMatch = line.match(/^[A-D]\.\s*[❶❷❸❹]?(.+)$/);
    if (abMatch) {
      options.push(stripOption(abMatch[1]));
      continue;
    }

    if (line.includes("문제:") || line.includes("問題:")) {
      japanese = line.replace(/^(問題|문제):\s*/, "").replace(/^「|」$/g, "").trim();
      continue;
    }

    // Korean template: lines with 한글 before options (can be multi-line, with or without blanks)
    if (
      line.match(/[가-힣]/) &&
      !line.startsWith("❶") &&
      !line.startsWith("【") &&
      !line.match(/^[A-D]\.\s*[❶❷❸❹]?/)
    ) {
      if (line.includes("________") || line.includes("___") || line.includes("_")) {
        let processed = line
          .replace(/\(A\)\s*_+/g, BLANK)
          .replace(/\(B\)\s*_+/g, BLANK)
          .replace(/\(C\)\s*_+/g, BLANK)
          .replace(/\(D\)\s*_+/g, BLANK)
          .replace(/_+/g, BLANK)
          .replace(new RegExp(BLANK + "\\s*" + BLANK, "g"), BLANK + BLANK);
        if (!processed.includes(BLANK)) {
          processed = line.replace(/_+/g, BLANK);
        }
        koreanTemplateLines.push(processed);
      } else if (koreanTemplateLines.length > 0 || line.length < 80) {
        // Consecutive Korean line (e.g. "세일이라서 백화점에 갔는데") or short Korean line
        koreanTemplateLines.push(line);
      }
      continue;
    }

    if (
      state !== "explanation" &&
      line.match(/^[「『].*[」』]$/) &&
      line.includes("。") &&
      !japanese
    ) {
      japanese = line.replace(/^[「『]|[」』]$/g, "").trim();
      continue;
    }

    // Multi-line Japanese: lines with hiragana/kanji, (A)(B) etc., ending with 。or 、, before options
    // Exclude the question line "次の文を韓国語にすると一番自然なのはどれでしょうか。"
    if (
      state !== "explanation" &&
      !options.length &&
      !koreanTemplateLines.length &&
      line.match(/[\u3040-\u309F\u4E00-\u9FFF]/) &&
      (line.endsWith("。") || line.endsWith("、")) &&
      !line.startsWith("【") &&
      !line.startsWith("❶") &&
      !line.includes("次の文を韓国語にすると一番自然なのはどれでしょうか")
    ) {
      japaneseLines.push(line);
      continue;
    }

    if (
      state !== "explanation" &&
      line.match(/[가-힣]/) &&
      !options.length &&
      !koreanTemplateLines.length &&
      line.length < 100
    ) {
      if (line.includes("________") || line.includes("_")) {
        koreanTemplateLines.push(line.replace(/_+/g, BLANK));
      }
    }
  }

  const koreanTemplate = koreanTemplateLines.join("\n");

  if (japaneseLines.length && !japanese) {
    japanese = japaneseLines.join("");
  }

  explanation = explLines.join("\n").trim();

  if (!japanese && block.includes("問題:")) {
    const m = block.match(/問題:\s*([^\n]+)/);
    if (m) japanese = m[1].replace(/^「|」$/g, "").trim();
  }

  quizzes.push({
    id: num,
    question: QUESTION,
    japanese: japanese || "",
    koreanTemplate: koreanTemplate.trim() || BLANK + ".",
    options: [
      { id: 1, text: options[0] || "" },
      { id: 2, text: options[1] || "" },
      { id: 3, text: options[2] || "" },
      { id: 4, text: options[3] || "" },
    ],
    correctAnswer,
    explanation,
    vocabulary: [],
  });
}

quizzes.sort((a, b) => a.id - b.id);

const outLines = [
  'const QUESTION = "次の文を韓国語にすると一番自然なのはどれでしょうか。";',
  "",
  "const BLANK = \"_________________________\";",
  "",
  "export const QUIZZES = [",
];

for (const q of quizzes) {
  const explEsc = q.explanation
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");
  outLines.push("  {");
  outLines.push(`    id: ${q.id},`);
  outLines.push(`    question: QUESTION,`);
  outLines.push(`    japanese: ${JSON.stringify(q.japanese)},`);
  outLines.push(`    koreanTemplate: ${JSON.stringify(q.koreanTemplate)},`);
  outLines.push("    options: [");
  for (const o of q.options) {
    outLines.push(`      { id: ${o.id}, text: ${JSON.stringify(o.text)} },`);
  }
  outLines.push("    ],");
  outLines.push(`    correctAnswer: ${q.correctAnswer},`);
  outLines.push(`    explanation: \`${explEsc}\`,`);
  outLines.push("    vocabulary: [],");
  outLines.push("  },");
}

outLines.push("  ...Array.from({ length: 10 }, (_, i) => ({");
outLines.push("    id: 91 + i,");
outLines.push("    question: QUESTION,");
outLines.push('    japanese: "",');
outLines.push('    koreanTemplate: BLANK + ".",');
outLines.push("    options: [");
outLines.push('      { id: 1, text: "" },');
outLines.push('      { id: 2, text: "" },');
outLines.push('      { id: 3, text: "" },');
outLines.push('      { id: 4, text: "" },');
outLines.push("    ],");
outLines.push("    correctAnswer: 1,");
outLines.push('    explanation: "",');
outLines.push("    vocabulary: [],");
outLines.push("  })),");
outLines.push("];");
outLines.push("");
outLines.push("export type Quiz = (typeof QUIZZES)[number];");

fs.writeFileSync(path.join(__dirname, "../app/quiz-data.ts"), outLines.join("\n"));
console.log("Generated", quizzes.length, "quizzes (1-90 filled, 91-100 empty)");
