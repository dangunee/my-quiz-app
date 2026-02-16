/**
 * Google Sheets CSV → quiz-data.ts 변환 스크립트
 *
 * 사용법:
 * 1. Google Sheets에서 데이터 정리 후 CSV로 다운로드
 * 2. node scripts/convert-sheets-to-quiz.js data/quiz.csv
 *
 * CSV 컬럼 순서:
 * question, japanese, koreanTemplate, option1, option2, option3, option4, correctAnswer, explanation, vocabulary
 *
 * vocabulary 형식: "단어:의미|단어2:의미2" (선택, 비어있어도 됨)
 */

const fs = require("fs");
const path = require("path");

// CSV 파싱 (멀티라인 따옴표 필드 지원)
function parseCSV(content) {
  const clean = content.replace(/^\uFEFF/, "");
  const rows = [];
  let i = 0;

  while (i < clean.length) {
    const row = [];
    while (i < clean.length) {
      let field = "";
      if (clean[i] === '"') {
        i++;
        while (i < clean.length) {
          if (clean[i] === '"') {
            i++;
            if (clean[i] === '"') {
              field += '"';
              i++;
            } else break;
          } else {
            field += clean[i];
            i++;
          }
        }
      } else {
        while (i < clean.length && clean[i] !== "," && clean[i] !== "\t" && clean[i] !== "\n" && clean[i] !== "\r") {
          field += clean[i];
          i++;
        }
      }
      row.push(field.trim());
      if (clean[i] === "," || clean[i] === "\t") i++;
      else if (clean[i] === "\r") { i++; if (clean[i] === "\n") i++; break; }
      else if (clean[i] === "\n") { i++; break; }
      else break;
    }
    if (row.some((c) => c || row.length > 1)) rows.push(row);
  }
  return rows;
}

// vocabulary 문자열 파싱: "단어:의미|단어2:의미2" → [{word, meaning}]
function parseVocabulary(str) {
  if (!str || !str.trim()) return undefined;
  const items = str.split("|").filter((s) => s.trim());
  if (items.length === 0) return undefined;

  return items.map((item) => {
    const [word, meaning] = item.split(":").map((s) => s.trim());
    return { word: word || "", meaning: meaning || "" };
  });
}

// ❶❷❸❹ → 1,2,3,4 변환
function parseCorrectAnswer(str) {
  if (!str || !str.trim()) return 1;
  const s = str.trim();
  if (s === "❶" || s === "1") return 1;
  if (s === "❷" || s === "2") return 2;
  if (s === "❸" || s === "3") return 3;
  if (s === "❹" || s === "4") return 4;
  const num = parseInt(s, 10);
  return num >= 1 && num <= 4 ? num : 1;
}

// 퀴즈 데이터 생성
// CSV 컬럼: (index), question, japanese, koreanTemplate, option1, option2, option3, option4, correctAnswer, explanation, vocabulary
function generateQuizData(rows) {
  return rows
    .filter((row) => {
      if (!row.length) return false;
      const first = String(row[0]).trim();
      if (!/^\d+$/.test(first)) return false; // 헤더 또는 비정상 행 제외
      const data = row.slice(1);
      const japanese = (data[1] || "").trim();
      const option1 = (data[3] || "").trim();
      return japanese && option1;
    })
    .map((row, index) => {
    // 첫 번째 컬럼이 index(번호)이면 제외
    const data = row[0] && /^\d+$/.test(String(row[0]).trim()) ? row.slice(1) : row;
    const [
      question = "次の文を韓国語にすると一番自然なのはどれでしょうか。",
      japanese = "",
      koreanTemplate = "",
      option1 = "",
      option2 = "",
      option3 = "",
      option4 = "",
      correctAnswerStr = "1",
      explanation = "",
      vocabularyStr = "",
    ] = data;

    const correctAnswer = parseCorrectAnswer(correctAnswerStr);
    const vocabulary = parseVocabulary(vocabularyStr);

    // 옵션 텍스트에서 선행 ❶❷❸❹ 제거 (QuizClient에서 자동 추가)
    const stripOptionNumber = (t) => (t || "").trim().replace(/^[❶❷❸❹]\s*/, "");

    return {
      id: index + 1,
      question,
      japanese,
      koreanTemplate: koreanTemplate.replace(/_{2,}/g, "_________________________"),
      options: [
        { id: 1, text: stripOptionNumber(option1) },
        { id: 2, text: stripOptionNumber(option2) },
        { id: 3, text: stripOptionNumber(option3) },
        { id: 4, text: stripOptionNumber(option4) },
      ],
      correctAnswer: Math.min(Math.max(correctAnswer, 1), 4),
      explanation,
      vocabulary,
    };
  });
}

// TypeScript 파일 생성
function toTypeScript(quizData) {
  const items = quizData
    .map(
      (q) => `  {
    id: ${q.id},
    question: ${JSON.stringify(q.question)},
    japanese: ${JSON.stringify(q.japanese)},
    koreanTemplate: ${JSON.stringify(q.koreanTemplate)},
    options: [
      { id: 1, text: ${JSON.stringify(q.options[0]?.text || "")} },
      { id: 2, text: ${JSON.stringify(q.options[1]?.text || "")} },
      { id: 3, text: ${JSON.stringify(q.options[2]?.text || "")} },
      { id: 4, text: ${JSON.stringify(q.options[3]?.text || "")} },
    ],
    correctAnswer: ${q.correctAnswer},
    explanation: ${JSON.stringify(q.explanation)},
    ${q.vocabulary ? `vocabulary: ${JSON.stringify(q.vocabulary)},` : ""}
  }`
    )
    .join(",\n");

  return `export type QuizOption = {
  id: number;
  text: string;
  percentage?: number;
};

export type QuizItem = {
  id: number;
  question: string;
  japanese: string;
  koreanTemplate: string;
  options: QuizOption[];
  correctAnswer: number;
  explanation: string;
  vocabulary?: { word: string; meaning: string; example?: string }[];
};

export const quizData: QuizItem[] = [
${items}
];
`;
}

// 메인
const csvPath = process.argv[2] || path.join(__dirname, "../data/quiz.csv");
const outputPath =
  process.argv[3] || path.join(__dirname, "../app/quiz-data.ts");

if (!fs.existsSync(csvPath)) {
  console.error(`파일을 찾을 수 없습니다: ${csvPath}`);
  console.log(`
사용법:
  node scripts/convert-sheets-to-quiz.js <CSV파일경로> [출력파일경로]

예시:
  node scripts/convert-sheets-to-quiz.js data/quiz.csv
  node scripts/convert-sheets-to-quiz.js data/quiz.csv app/quiz-data.ts

Google Sheets에서:
  1. 파일 → 다운로드 → CSV(.csv)
  2. data/quiz.csv 로 저장
`);
  process.exit(1);
}

const content = fs.readFileSync(csvPath, "utf-8");
const rows = parseCSV(content);
const quizData = generateQuizData(rows);
const tsContent = toTypeScript(quizData);

// data 폴더 생성
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, tsContent, "utf-8");
console.log(`✅ ${quizData.length}개 퀴즈 변환 완료 → ${outputPath}`);
