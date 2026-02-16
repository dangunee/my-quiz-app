const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "../data/quiz.csv");
const csv = fs.readFileSync(csvPath, "utf-8");
const lines = csv.split("\n");

const CIRCLE_TO_NUM = { "❶": 1, "❷": 2, "❸": 3, "❹": 4 };

function parseCsvLine(line, inMultiline) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || (c === "\n" && !inQuiline)) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function parseRow(line) {
  const parts = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQ = !inQ;
    else if ((c === "," && !inQ) || c === "\n") {
      parts.push(cur.replace(/^"|"$/g, "").trim());
      cur = "";
    } else cur += c;
  }
  if (cur) parts.push(cur.replace(/^"|"$/g, "").trim());
  return parts;
}

const rows = [];
let buf = "";
for (const line of lines) {
  buf += (buf ? "\n" : "") + line;
  const quoteCount = (buf.match(/"/g) || []).length;
  if (quoteCount % 2 === 0) {
    rows.push(buf);
    buf = "";
  }
}
if (buf) rows.push(buf);

const header = rows[0];
const dataRows = rows.slice(1).filter((r) => r.trim());

const quizzes = [];
for (const row of dataRows) {
  const parts = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (c === '"') inQ = !inQ;
    else if (c === "," && !inQ) {
      parts.push(cur.trim().replace(/^"|"$/g, "").replace(/\\n/g, "\n"));
      cur = "";
    } else cur += c;
  }
  parts.push(cur.trim().replace(/^"|"$/g, "").replace(/\\n/g, "\n"));

  if (parts.length < 10) continue;
  const [idx, question, japanese, koreanTemplate, o1, o2, o3, o4, correct, expl, vocab] = parts;

  const stripNum = (s) => (s || "").replace(/^[❶❷❸❹]\s*/, "").trim();
  const correctNum = CIRCLE_TO_NUM[correct?.trim().charAt(0)] || 1;

  quizzes.push({
    id: parseInt(idx, 10) || quizzes.length + 1,
    question: question || "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    japanese: japanese || "",
    koreanTemplate: (koreanTemplate || "").replace(/_{10,}/g, "_________________________"),
    options: [
      { id: 1, text: stripNum(o1) },
      { id: 2, text: stripNum(o2) },
      { id: 3, text: stripNum(o3) },
      { id: 4, text: stripNum(o4) },
    ],
    correctAnswer: correctNum,
    explanation: (expl || "").replace(/\n/g, "\\n"),
    vocabulary: vocab ? vocab.split(",").map((v) => v.trim()).filter(Boolean) : [],
  });
}

const out = `export const QUIZZES = ${JSON.stringify(quizzes, null, 2)} as const;
export type Quiz = (typeof QUIZZES)[number];
`;
fs.writeFileSync(path.join(__dirname, "../app/quiz-data.ts"), out);
console.log("Generated", quizzes.length, "quizzes");
