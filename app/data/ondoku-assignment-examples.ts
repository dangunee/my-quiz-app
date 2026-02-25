// 音読トレーニング 課題例 (1期～8期, 10 items each)
export type OndokuExampleItem = {
  title: string;
  topic: string;
  modelContent?: {
    theme: string;
    sentence: string;
    pronunciationNote?: string;
    patterns: { pattern: string; example: string }[];
  };
};

export const ONDOKU_PERIOD_EXAMPLES: OndokuExampleItem[][] = [
  [
    { title: "-아/어지다", topic: "形容詞の自然な変化", modelContent: { theme: "-아/어지다", sentence: "겨울이 가까워지면서 해가 짧아지고 추워졌어요.", pronunciationNote: "発音ポイント：複合母音、二重バッチム、濃音、激音", patterns: [{ pattern: "-아/어지다", example: "날씨가 좋아졌어요, 얼굴이 예뻐졌어요" }] } },
    { title: "-(으)ㄹ 줄 알다", topic: "(習って)することができる", modelContent: { theme: "-(으)ㄹ 줄 알다", sentence: "한국 사람들은 모두 김치를 담글 줄 알아요?", pronunciationNote: "発音ポイント：ㄹの発音、連音", patterns: [{ pattern: "-(으)ㄹ 줄 알다", example: "수영할 줄 알아요?" }] } },
    { title: "-(으)ㄹ 줄 모르다", topic: "(習って)できない", modelContent: { theme: "-(으)ㄹ 줄 모르다", sentence: "저는 면허가 없어요. 운전할 줄 모릅니다.", pronunciationNote: "発音ポイント：ㅎの発音、二重バッチム、鼻音化", patterns: [{ pattern: "-(으)ㄹ 줄 모르다", example: "저는 영어를 할 줄 몰라요." }] } },
    { title: "-게 되다", topic: "～ようになる", modelContent: { theme: "-게 되다", sentence: "한국 드라마가 좋아서 한국어를 공부하게 되었어요.", pronunciationNote: "発音ポイント：連音、濃音化", patterns: [{ pattern: "-게 되다", example: "말하게 되었어요" }] } },
    { title: "-아/어 보이다", topic: "～く見える", modelContent: { theme: "-아/어 보이다", sentence: "나이보다 어려 보여요.", pronunciationNote: "発音ポイント：이の縮約", patterns: [{ pattern: "-아/어 보이다", example: "맛있어 보여요" }] } },
    { title: "-를 닮다/비슷하다", topic: "～に似ている", modelContent: { theme: "-를 닮다/비슷하다", sentence: "어머니를 많이 닮았어요.", pronunciationNote: "発音ポイント：ㄹパッチム", patterns: [{ pattern: "-를 닮다", example: "누구를 닮았는가?" }] } },
    { title: "-라고 하다", topic: "～という", modelContent: { theme: "-라고 하다", sentence: "나는 신림동에 사는 홍길동이라고 해요.", pronunciationNote: "発音ポイント：ㄹの発音", patterns: [{ pattern: "-라고 하다", example: "~라고 합니다" }] } },
    { title: "-라고 생각하다", topic: "～だと思う", modelContent: { theme: "-라고 생각하다", sentence: "저는 소극적인 성격이라고 생각해요.", pronunciationNote: "発音ポイント：激音", patterns: [{ pattern: "-라고 생각하다", example: "~라고 생각합니다" }] } },
    { title: "初対面の挨拶", topic: "첫인사", modelContent: { theme: "初対面の挨拶", sentence: "처음 뵙겠습니다. 저는 사토 리에라고 합니다.", pronunciationNote: "発音ポイント：ㅂパッチム、連音", patterns: [{ pattern: "自己紹介", example: "저는 ~라고 합니다" }] } },
    { title: "日常会話", topic: "일상회화", modelContent: { theme: "日常会話", sentence: "오늘 날씨가 좋네요. 주말에 뭐 하실 거예요?", pronunciationNote: "発音ポイント：抑揚、リズム", patterns: [{ pattern: "会話表現", example: "~네요, ~실 거예요" }] } },
  ],
  [
    { title: "-면서", topic: "～ながら", modelContent: { theme: "-면서", sentence: "음악을 들으면서 공부해요.", pronunciationNote: "発音ポイント：連音", patterns: [{ pattern: "-(으)면서", example: "먹으면서 이야기해요" }] } },
    { title: "-기 전에", topic: "～する前に", modelContent: { theme: "-기 전에", sentence: "잠자기 전에 양치해요.", pronunciationNote: "発音ポイント：기の発音", patterns: [{ pattern: "-기 전에", example: "출발하기 전에" }] } },
    { title: "-(으)ㄴ 후에", topic: "～した後で", modelContent: { theme: "-(으)ㄴ 후에", sentence: "밥 먹은 후에 산책해요.", pronunciationNote: "発音ポイント：ㅎの弱音", patterns: [{ pattern: "-(으)ㄴ 후에", example: "일이 끝난 후에" }] } },
    { title: "-을 때", topic: "～時", modelContent: { theme: "-을 때", sentence: "스트레스를 받을 때 음악을 들어요.", pronunciationNote: "発音ポイント：ㄹパッチム", patterns: [{ pattern: "-(으)ㄹ 때", example: "바쁠 때" }] } },
    { title: "-기 때문에", topic: "～ので", modelContent: { theme: "-기 때문에", sentence: "날씨가 좋기 때문에 산책하고 싶어요.", pronunciationNote: "発音ポイント：濃音", patterns: [{ pattern: "-기 때문에", example: "바쁘기 때문에" }] } },
    { title: "-(으)려고", topic: "～しようと", modelContent: { theme: "-(으)려고", sentence: "살을 빼려고 저녁을 굶기로 했어요.", pronunciationNote: "発音ポイント：ㄹの発音", patterns: [{ pattern: "-(으)려고", example: "공부하려고" }] } },
    { title: "-도록", topic: "～ように", modelContent: { theme: "-도록", sentence: "일찍 자도록 노력해요.", pronunciationNote: "発音ポイント：ㄹパッチム", patterns: [{ pattern: "-도록", example: "잊지 않도록" }] } },
    { title: "-아/어서", topic: "～て、～ので", modelContent: { theme: "-아/어서", sentence: "친구가 도와줘서 감사해요.", pronunciationNote: "発音ポイント：縮約", patterns: [{ pattern: "-아/어서", example: "맛있어서" }] } },
    { title: "-ㄴ/은/(으)ㄹ 수 있다", topic: "～できる", modelContent: { theme: "-ㄴ/은/(으)ㄹ 수 있다", sentence: "한국어로 말할 수 있어요.", pronunciationNote: "発音ポイント：수の発音", patterns: [{ pattern: "-(으)ㄹ 수 있다", example: "할 수 있어요" }] } },
    { title: "-고 싶다", topic: "～たい", modelContent: { theme: "-고 싶다", sentence: "한국에 가고 싶어요.", pronunciationNote: "発音ポイント：ㅅの変化", patterns: [{ pattern: "-고 싶다", example: "먹고 싶어요" }] } },
  ],
  [
    { title: "政治・経済①", topic: "정치", modelContent: { theme: "政治", sentence: "한국의 경제가 빠르게 성장하고 있습니다.", pronunciationNote: "発音ポイント：長文の抑揚", patterns: [] } },
    { title: "政治・経済②", topic: "경제", modelContent: { theme: "経済", sentence: "물가가 올라가서 생활비가 부담돼요.", pronunciationNote: "発音ポイント：連音", patterns: [] } },
    { title: "文化①", topic: "문화", modelContent: { theme: "文化", sentence: "한국의 전통 음식인 김치를 만들어 봤어요.", pronunciationNote: "発音ポイント：濃音", patterns: [] } },
    { title: "文化②", topic: "문화", modelContent: { theme: "文化", sentence: "설날에 떡국을 먹는 것이 한국의 풍습이에요.", pronunciationNote: "発音ポイント：ㄱパッチム", patterns: [] } },
    { title: "ドラマ①", topic: "드라마", modelContent: { theme: "ドラマ", sentence: "최근에 본 드라마가 너무 재미있었어요.", pronunciationNote: "発音ポイント：激音", patterns: [] } },
    { title: "ドラマ②", topic: "드라마", modelContent: { theme: "ドラマ", sentence: "주인공의 대사가 인상적이었어요.", pronunciationNote: "発音ポイント：二重パッチム", patterns: [] } },
    { title: "日常会話①", topic: "일상", modelContent: { theme: "日常会話", sentence: "오늘 회의가 있어서 바쁠 것 같아요.", pronunciationNote: "発音ポイント：リズム", patterns: [] } },
    { title: "日常会話②", topic: "일상", modelContent: { theme: "日常会話", sentence: "주말에 친구들이랑 영화를 보기로 했어요.", pronunciationNote: "発音ポイント：ㄹの発音", patterns: [] } },
    { title: "長文①", topic: "장문", modelContent: { theme: "長文", sentence: "한국어를 배우기 시작한 지 1년이 됐어요. 처음에는 발음이 어려웠는데 지금은 조금 나아졌어요.", pronunciationNote: "発音ポイント：文の区切り、抑揚", patterns: [] } },
    { title: "長文②", topic: "장문", modelContent: { theme: "長文", sentence: "한국 드라마를 보면서 한국어를 공부하고 있어요. 자막 없이 이해할 수 있는 날이 오면 좋겠어요.", pronunciationNote: "発音ポイント：流暢性", patterns: [] } },
  ],
  // 4期～8期
  ...["政治", "経済", "文化", "ドラマ", "日常"].map((field, fi) =>
    Array.from({ length: 10 }, (_, i) => ({
      title: `${field} ${i + 1}`,
      topic: "",
      modelContent: {
        theme: `${field}分野`,
        sentence: `音読課題 4期以降 ${field} ${i + 1}回目。課題文を声に出して読んでください。`,
        pronunciationNote: "発音・抑揚・リズムに注意して読んでください。",
        patterns: [],
      },
    }))
  ),
];
