export type QuizOption = {
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
  {
    id: 1,
    question: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    japanese: "今回のイベントの司会をすることにしました。",
    koreanTemplate: "이번 이벤트의 사회를 _________________________ .",
    options: [
      { id: 1, text: "하게 됐어요", percentage: 18.2 },
      { id: 2, text: "맡게 했어요", percentage: 16.9 },
      { id: 3, text: "맡기로 됐어요", percentage: 32.5 },
      { id: 4, text: "보기로 했어요", percentage: 32.5 },
    ],
    correctAnswer: 4,
    explanation:
      "「司会をする」は韓国語で「사회를 보다」。「~하기로 했다」は「~することにした」の意味。正解は「보기로 했어요」。",
    vocabulary: [
      { word: "사회를 보다", meaning: "司会をする、MCを務める" },
      { word: "~하기로 했다", meaning: "~することにした" },
    ],
  },
  {
    id: 2,
    question: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    japanese: "好きな歌手のチケットをやっと手に入れました。",
    koreanTemplate: "좋아하는 가수의 티켓을 _________________________ .",
    options: [
      { id: 1, text: "구했어요", percentage: 42 },
      { id: 2, text: "찾았어요", percentage: 28 },
      { id: 3, text: "받았어요", percentage: 18 },
      { id: 4, text: "가졌어요", percentage: 12 },
    ],
    correctAnswer: 1,
    explanation:
      "「手に入れる」は韓国語で「구하다」。苦労して手に入れたニュアンス。",
    vocabulary: [
      { word: "구하다", meaning: "手に入れる" },
      { word: "어렵게", meaning: "やっと、苦労して" },
    ],
  },
  {
    id: 3,
    question: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    japanese: "そのブランドはいつも新しいスタイルを追求しています。",
    koreanTemplate: "그 브랜드는 늘 새로운 스타일을 _________________________ .",
    options: [
      { id: 1, text: "찾습니다", percentage: 25 },
      { id: 2, text: "추구합니다", percentage: 45 },
      { id: 3, text: "원합니다", percentage: 18 },
      { id: 4, text: "만듭니다", percentage: 12 },
    ],
    correctAnswer: 2,
    explanation: "「追求する」は韓国語で「추구하다」。",
    vocabulary: [
      { word: "추구하다", meaning: "追求する" },
      { word: "늘", meaning: "いつも" },
    ],
  },
  {
    id: 4,
    question: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    japanese: "本当にこんな出会いを望んでいました。",
    koreanTemplate: "정말 이런 _________________________ .",
    options: [
      { id: 1, text: "만남을 원했어요", percentage: 38 },
      { id: 2, text: "만남을 찾았어요", percentage: 32 },
      { id: 3, text: "만남이 있었어요", percentage: 20 },
      { id: 4, text: "만남을 했어요", percentage: 10 },
    ],
    correctAnswer: 1,
    explanation: "「出会いを望む」は韓国語で「만남을 원하다」。",
    vocabulary: [
      { word: "만남을 원하다", meaning: "出会いを望む、欲しがる" },
      { word: "만남을 찾다", meaning: "出会いを求める、探す" },
    ],
  },
  {
    id: 5,
    question: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    japanese: "明日は会議があるので早く来てください。",
    koreanTemplate: "내일 회의가 있어서 _________________________ .",
    options: [
      { id: 1, text: "일찍 오세요", percentage: 40 },
      { id: 2, text: "빨리 오세요", percentage: 35 },
      { id: 3, text: "서둘러 오세요", percentage: 15 },
      { id: 4, text: "급히 오세요", percentage: 10 },
    ],
    correctAnswer: 1,
    explanation:
      "「早く来る」は「일찍 오다」。時間が早いこと。「빨리」は速度が速いこと。",
    vocabulary: [
      { word: "일찍", meaning: "早く（時間）" },
      { word: "빨리", meaning: "速く（速度）" },
    ],
  },
];
