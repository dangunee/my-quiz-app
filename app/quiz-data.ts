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
    question: "1",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「今日も上司に一言いわれた。」",
    options: [
      { id: 1, text: "오늘도 ______________." },
      { id: 2, text: "❶상사가 한 말 했다" },
      { id: 3, text: "❷상사가 한 소리 말했다" },
      { id: 4, text: "❸상사에게 한 소리 들었다" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 2,
    question: ",❹상사에게 한 소리 말해졌다,❸,",
    japanese: "上司に=상사에게",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 3,
    question: "一言=한 소리",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 4,
    question: "いわれる=듣다(聞く)",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 5,
    question: "小言の意味では한 말と言わない。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 6,
    question: "❶は상사가 한 소리 했다になる。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 7,
    question: "❷한 소리 말하다は소리に言葉の意味があるので不自然。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 8,
    question: "❹말해지다とは言わない。\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 9,
    question: "2",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「メールで返事してほしいです。」",
    options: [
      { id: 1, text: "메일로 ______________." },
      { id: 2, text: "❶대답해 주세요" },
      { id: 3, text: "❷대답을 주시면 좋아요" },
      { id: 4, text: "❸답장을 듣고 싶어요" },
    ],
    correctAnswer: 1,
    explanation: "❹",
    vocabulary: [{"word":"❶ 대답→답장","meaning":""}],
  },
  {
    id: 10,
    question: "대답は声で答える時のみ使い、メールでは使いません。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 11,
    question: "❷ ~면 좋아요 ～したらいいです。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 12,
    question: "라면에 김치를 넣으면 좋아요",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 13,
    question: "ラーメンにキムチを入れたらいいです",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 14,
    question: "❹~면 좋겠어요 ～してほしいです",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 15,
    question: "여기에 써 주시면 좋겠어요",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 16,
    question: "ここに書いてほしいです。\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 17,
    question: "3",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「そうするわけにはいきません」",
    options: [
      { id: 1, text: "그렇게 __________________." },
      { id: 2, text: "❶할 것은 없습니다" },
      { id: 3, text: "❷할 수는 없습니다" },
      { id: 4, text: "❸할 셈은 없습니다" },
    ],
    correctAnswer: 1,
    explanation: "❷",
    vocabulary: [{"word":"❶그렇게 할 것은 없습니다","meaning":""}],
  },
  {
    id: 18,
    question: "=そうすることはありません",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 19,
    question: "*그렇게까지 할 것은 없어",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 20,
    question: "=そこまですることはない",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 21,
    question: "❸그렇게 할 셈은 없습니다 (x)",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 22,
    question: "* 그렇게 할 셈이야?",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 23,
    question: "=そうする気なの？",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 24,
    question: "❹그렇게 할 리는 없습니다.",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 25,
    question: "=そうするはずはありません。\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 26,
    question: "4",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「なんでそんなことを言うの？」",
    options: [
      { id: 1, text: "왜 ____________________." },
      { id: 2, text: "❶ 그런 것을 말해?" },
      { id: 3, text: "❷ 그런 말을 말해?" },
      { id: 4, text: "❸ 그런 것을 해?" },
    ],
    correctAnswer: 1,
    explanation: "❹",
    vocabulary: [{"word":"❶の「そんなこと」を그런 것と言いがちですが、「そんなこと」は그런 말または그런 소리が自然です。","meaning":""}],
  },
  {
    id: 27,
    question: "❶왜 그런 이야기를 해?　だとOKです。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 28,
    question: "❷왜 그런 말을 해?　だとOKです。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 29,
    question: "❸왜 그런 짓을 해?(なんでそんなことをするの)　に変えると自然な韓国語になります。\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 30,
    question: "5",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「それでも僕はやっていない」",
    options: [
      { id: 1, text: "그래도 내가 ______________." },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 31,
    question: ",❶ 하지 않아,❷ 하지 않았어,❸ 하지 않고 있어,❹ 하고 있지 않았어,❷,",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 32,
    question: "~していない=~하지 않았어",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 33,
    question: "~하지 않아は「元々~しない」という意味になります。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 34,
    question: "❸〜하지 않고 있어 〜しないでいる",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 35,
    question: "❹〜하지 않고 있었어 〜しないでいた",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 36,
    question: "※ 僕、宿題まだやってない",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 37,
    question: "= 나",
    japanese: "숙제 아직 안 했어",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 38,
    question: ",",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 39,
    question: "6",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「その店は学生時代によく行っていました」",
    options: [
      { id: 1, text: "그 가게는 ________________________." },
      { id: 2, text: "❶ 학생 시절에 자주 갔었어요" },
      { id: 3, text: "❷ 학생 시대에 자주 가고 있었어요" },
      { id: 4, text: "❸ 학생 시절에 자주 가 있었어요" },
    ],
    correctAnswer: 1,
    explanation: "❶",
    
  },
  {
    id: 40,
    question: ",",
    japanese: "ある時の習慣のことを言う時は～았/었다を使います。",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 41,
    question: "～고 있었다は特定の瞬間に何をしていたかを説明するときだけ使います。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 42,
    question: "지진이 났을 때 밥을 먹고 있었어요.",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 43,
    question: "地震が起きた時ご飯を食べていました。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 44,
    question: "❸ 가 있다は既にそこに到着している時",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 45,
    question: "❹ 가고 있어요今向かっている",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 46,
    question: "※ 학생시대 (✖)\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 47,
    question: "7",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「トイレで水を流しました」",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 48,
    question: ",",
    japanese: "화장실에서 ______________.",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 49,
    question: ",❶물이 흘렀어요,❷물을 흘렸어요,❸물이 내렸어요,❹물을 내렸어요,❹,",
    japanese: "❶물이 흐르다水が流れる←水漏れしているような感じ",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 50,
    question: "❷물을 흘리다水をこぼす←トイレで水筒などの水をこぼしてしまった感じです。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 51,
    question: "❸물이 내리다　「水が流した」なので不自然です",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 52,
    question: "❹물을 내리다",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 53,
    question: "※ 내리다は降ろす、降りる、降るとの意味ですが、トイレでは水を流すの意味になります。\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 54,
    question: "8",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「ゴミは決められた所に出してください」",
    options: [
      { id: 1, text: "쓰레기는 ________________________." },
      { id: 2, text: "❶정해진 곳에 내세요" },
      { id: 3, text: "❷정해진 곳에 내놓으세요" },
      { id: 4, text: "❸결정된 곳에 내세요" },
    ],
    correctAnswer: 1,
    explanation: "❷",
    vocabulary: [{"word":"必要なものを出す、払う=내다","meaning":""}],
  },
  {
    id: 55,
    question: "手放す、捨てる=내놓다",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 56,
    question: "なので❶はバツ印",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 57,
    question: "❸결정된→정해진",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 58,
    question: "결정된は主に会議内容や決定事項などに主に使います。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 59,
    question: "例)",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 60,
    question: "결정된 사항(決定した事項)",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 61,
    question: "회의에서 결정된 것이 없다.",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 62,
    question: "会議でまだ決まったことはない。\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 63,
    question: "9",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「プロでも失敗することがある」",
    options: [
      { id: 1, text: "프로라도 ________________." },
      { id: 2, text: "❶ 실수하는 것이 있다" },
      { id: 3, text: "❷ 실수할 것이 있다" },
      { id: 4, text: "❸ 실수하는 경우가 있다" },
    ],
    correctAnswer: 1,
    explanation: "❸",
    
  },
  {
    id: 64,
    question: ",",
    japanese: "「〜することがある」",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 65,
    question: "→「～する場合がある」とのニュアンスで、一般的に〜する「習慣」や「傾向」がある、というような時は❸～하는 경우가 있다を使います。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 66,
    question: "例)",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 67,
    question: "우리회사는 일이 많으면 야근하는 경우도 있습니다.",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 68,
    question: "うちの会社は仕事が多いと残業することもあります。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 69,
    question: ",",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 70,
    question: "10",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「身分証をお持ちですか」",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 71,
    question: ",신분증을 ______________.,❶가지세요?,❷가지고 있나요?,❸가져 계세요?,❹가지고 계세요?,❹,",
    japanese: "❶가지다+~세요→持ちなさい＝あげます",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 72,
    question: "❷가지고 있나요？→持っていますか？も文法的には間違いではありません。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 73,
    question: "❸가져 계세요/가져 있다 (X)",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 74,
    question: "～을/를 가지다は他動詞なので～아/어 있다を付けられません。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 75,
    question: "❹가지고 계세요が正解です。",
    japanese: "",
    koreanTemplate: ",",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 76,
    question: "11",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「こうした方がよく覚えられます」",
    options: [
      { id: 1, text: "이렇게 ______________________." },
      { id: 2, text: "❶하는 것이 잘 외울 수 있어요" },
      { id: 3, text: "❷하는 것이 잘 외우게 돼요" },
      { id: 4, text: "❸하는 편이 잘 외워져요" },
    ],
    correctAnswer: 1,
    explanation: "❸",
    vocabulary: [{"word":"❶は意味はわかるが不自然です。","meaning":""}],
  },
  {
    id: 77,
    question: "〜하는 것이+외울 수 있다は (✖)",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 78,
    question: "이렇게 하면 잘 외울 수 있어요(〇)",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 79,
    question: "（こうすればよく覚えられます）",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 80,
    question: "*～이/가 ～을 수 있다 (✖)",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 81,
    question: "～을/를 ～을 수 있다 (〇)",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 82,
    question: "❸외워지다は無理なく「覚えられる」の意味でよく使います。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 83,
    question: "❷、❹～게 되다は「～ことになる」",
    japanese: "",
    koreanTemplate: ",",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 84,
    question: "12",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「夜中２時なのにまだ起きているんですか？」",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 85,
    question: ",",
    japanese: "새벽 2시인데 아직도 _________________.",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 86,
    question: ",❶ 안 자 있어요?,❷ 안 자고 있어요?,❸ 일어나 있어요?,❹ 일어나고 있어요?,❷,",
    japanese: "❶자다+～아/어 있다 (✖)",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 87,
    question: "❸일어나 있다はベッドから起き上がっている状態です。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 88,
    question: "왜 아직도 일어나 있어요",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 89,
    question: "(なぜ寝転ばずまだ立っているの）",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 90,
    question: "❹일어나고 있다は今まさにベッドから起きあがりつつある状態です。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 91,
    question: "그는 지금 일어나고 있어요",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 92,
    question: "彼は今起き上がっている。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 93,
    question: "（今まさに起き上がりつつある最中）",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "," },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 94,
    question: "13",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「なぜ安定した職場を辞めるんですか」",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 95,
    question: ",",
    japanese: "왜  _____________ 그만두세요?",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 96,
    question: ",❶ 안정한 직장을,❷ 안정하는 직장을,❸ 안정되는 직장을,❹ 안정된 직장을,❹,",
    japanese: "安定するは안정되다を使います。",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 97,
    question: "안정하다は使わないので❶안정한、❷안정하는は不自然です。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 98,
    question: "❸안정되다は形容詞なので動詞連体形である～는は付けられません。\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 99,
    question: "14",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「今日面接なのでとても緊張する」",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 100,
    question: ",  오늘 _________________.,❶ 면접이니까 아주 긴장되.,❷ 면접이라서 아주 긴장함.,❸ 면접이라서 아주 긴장돼.,❹ 면접이니까 아주 긴장해.,❸,",
    japanese: "❶긴장되には+어が必要です。",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 101,
    question: "❷긴장함 緊張した(過去形)",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 102,
    question: "❹긴장해",
    japanese: "긴장해요は使いません。",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 103,
    question: "긴장하고 있다、긴장하지마、긴장했다は使います。\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 104,
    question: "15",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「彼は何度も自分のことが好きなのか聞いた」",
    options: [
      { id: 1, text: "그는 ______________ 물었다." },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 105,
    question: ",❶ 몇번을 자기를 사랑하는지,❷ 몇번이나 자기가 사랑하는지,❸ 몇번이고 자기를 사랑하느냐고,❹ 몇번도 자기를 사랑하느냐고,❸ ,",
    japanese: "何度も=몇 번이나=몇 번이고もOKです。",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 106,
    question: "❶몇 번을=何度か",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 107,
    question: "❷자기가 사랑하는 自分が好きなのか",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 108,
    question: "❹몇 번도は使わないので、注意してください！\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 109,
    question: "16",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「今忙しいから掃除は明日やります」",
    options: [
      { id: 1, text: "지금 _______ 청소는 내일 ________." },
      { id: 2, text: "❶ 바쁘니까 / 합니다" },
      { id: 3, text: "❷ 바빠서 / 할게요" },
      { id: 4, text: "❸ 바빠서 / 할 거예요" },
    ],
    correctAnswer: 1,
    explanation: "❶",
    vocabulary: [{"word":"このクイズは間違いを選ぶ問題です。","meaning":""}],
  },
  {
    id: 110,
    question: "掃除を明日やるので「やります」は未来の表現にしないといけません。現在形の합니다/해요は普段の習慣、決まりなど言う時のみ使いますので、내일と一緒に使います。のは間違いです。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 111,
    question: "未来を表す❷～을게요❸～을 거예요❹～겠はOKです。\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 112,
    question: "17",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「韓国ドラマを観て韓国のことが好きになった」",
    options: [
      { id: 1, text: "한국드라마를 _________________." },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 113,
    question: ",❶ 봐서 한국이 좋아졌다,❷ 보고 한국을 좋아하게 됐다,❸ 보니까 한국이 좋아졌다,❹ 보니 한국이 좋아하게 됐다,",
    japanese: "❷",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 114,
    question: ",",
    japanese: "❶봐서→보고",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 115,
    question: "何かを見て、読んで、聞いて(いいと思ったら)→읽다",
    japanese: "보다",
    koreanTemplate: "듣다などは～고を使います。",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 116,
    question: "❸보니까 見たら",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 117,
    question: "❹보니=보니까の縮約です。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 118,
    question: "※좋아지다=좋아하게 되다\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 119,
    question: "18",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「あなたに出会って幸せだった」",
    options: [
      { id: 1, text: "당신을 _________________." },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 120,
    question: ",",
    japanese: "❶ 만나고 행복했어",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 121,
    question: ",❷ 만나니까 행복이었어,❸ 만났으니까 행복이었어,❹ 만나서 행복했어,❹,",
    japanese: "❶만나고: 会ったことと関係ない",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 122,
    question: "당신을 만나고 (그 후에) 학교에 갔어요. OKです。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 123,
    question: "❷만나니까 (習慣)会うから",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 124,
    question: "당신을 만나니까 행복해 OKです。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 125,
    question: "❸만났으니까 (一度)会ったから",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 126,
    question: "어제 당신 만났으니까 오늘은 안 만나도 돼 OKです。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 127,
    question: "* 행복이었어→ 행복했어\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 128,
    question: "19",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「前もって言ってくれればよかったのに 。」",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 129,
    question: ",   미리 _________________.,❶ 이야기해 주지,❷ 이야기해 주지 그랬는데,❸ 이야기해 주면 좋았는데,❹ 이야기해 주면 잘됐을걸,❶,",
    japanese: "前もって言ってくれればよかったのに",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 130,
    question: "=미리 이야기해 주지 그랬어→그랬어は省略可",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 131,
    question: "=미리 이야기해주면 좋았을 텐데◯",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 132,
    question: "❷～해 주지 그랬는데✗　このような表現はない",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 133,
    question: "❸～해 주면 좋았는데✗　このような表現はない",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 134,
    question: "미리 이야기해 주면 좋았는데→좋았을 텐데だったらOKです。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 135,
    question: "좋았는데は以前「何かがよかったのに」という時に使います。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 136,
    question: "[例] 그 가게 좋았는데 / 그 사람 좋았는데",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 137,
    question: "❹～해 주지 잘됐을걸✗　このような表現はない\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 138,
    question: "20",
    japanese: "次の文を韓国語にすると一番自然なのはどれでしょうか。",
    koreanTemplate: "「それは二度と買いません」",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 139,
    question: ",",
    japanese: "그건 __________안 사요.",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 140,
    question: ",❶ 두 번도,❷ 두 번 다시,❸ 두 번이라도,❹ 두 번이라,❷,",
    japanese: "❶두 번도２回も",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 141,
    question: "소리내서 읽는 건 두 번도 좋고",
    japanese: "세 번도 좋아요",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 142,
    question: "音読するのは２回（するの）もいいし、３回（するの）もいいです。",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 143,
    question: "❸두 번이라도 ２回だとしても",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 144,
    question: "❹두 번이라(서) ２回なので",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 145,
    question: "二度と= 두 번 다시",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  },
  {
    id: 146,
    question: "二度と来るな = 두 번 다시 오지 마\"",
    japanese: "",
    koreanTemplate: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correctAnswer: 1,
    explanation: "",
    
  }
];
