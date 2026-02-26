// Default title and topic for 課題例 1期~8期 (10 items each)
export const DEFAULT_ASSIGNMENT_EXAMPLES: { title: string; topic: string }[][] = [
  [
    { title: "第1回課題", topic: "約束" },
    { title: "第2回課題", topic: "季節 (계절)" },
    { title: "第3回課題", topic: "나의 일과" },
    { title: "第4回課題", topic: "스트레스 푸는 법" },
    { title: "第5回課題", topic: "가족" },
    { title: "第6回課題", topic: "여행" },
    { title: "第7回課題", topic: "공연" },
    { title: "第8回課題", topic: "친구" },
    { title: "第9回課題", topic: "다이어트 및 건강관리" },
    { title: "第10回課題", topic: "인테리어" },
  ],
  ...Array(7).fill(null).map(() => Array(10).fill(null).map(() => ({ title: "", topic: "" }))),
];

export const PERIOD_LABELS = ["1期", "2期", "3期", "4期", "5期", "6期", "7期", "8期"];
