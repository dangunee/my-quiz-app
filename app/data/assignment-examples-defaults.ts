// Default title and topic for 課題例 1期~8期 (10 items each)
export const DEFAULT_ASSIGNMENT_EXAMPLES: { title: string; topic: string }[][] = [
  [
    { title: "第1回課題：　テーマ：約束", topic: "約束" },
    { title: "第2回課題：　テーマ：季節 (계절)", topic: "季節 (계절)" },
    { title: "第3回課題：　テーマ：나의 일과", topic: "나의 일과" },
    { title: "第4回課題：　テーマ：스트레스 푸는 법", topic: "스트레스 푸는 법" },
    { title: "第5回課題：　テーマ：가족", topic: "가족" },
    { title: "第6回課題：　テーマ：여행", topic: "여행" },
    { title: "第7回課題：　テーマ：공연", topic: "공연" },
    { title: "第8回課題：　テーマ：친구", topic: "친구" },
    { title: "第9回課題：　テーマ：다이어트 및 건강관리", topic: "다이어트 및 건강관리" },
    { title: "第10回課題：　テーマ：인테리어", topic: "인테리어" },
  ],
  [
    { title: "第1回課題：　テーマ：동호회, 모임", topic: "동호회, 모임" },
    { title: "第2回課題：　テーマ：시험", topic: "시험" },
    { title: "第3回課題：　テーマ：건강, 장수", topic: "건강, 장수" },
    { title: "第4回課題：　テーマ：뉴스", topic: "뉴스" },
    { title: "第5回課題：　テーマ：습관", topic: "습관" },
    { title: "第6回課題：　テーマ：성형수술", topic: "성형수술" },
    { title: "第7回課題：　テーマ：취업", topic: "취업" },
    { title: "第8回課題：　テーマ：선물", topic: "선물" },
    { title: "第9回課題：　テーマ：한국, 한국인", topic: "한국, 한국인" },
    { title: "第10回課題：　テーマ：요리", topic: "요리" },
  ],
  ...Array(6).fill(null).map(() => Array(10).fill(null).map(() => ({ title: "", topic: "" }))),
];

export const PERIOD_LABELS = ["1期", "2期", "3期", "4期", "5期", "6期", "7期", "8期"];
