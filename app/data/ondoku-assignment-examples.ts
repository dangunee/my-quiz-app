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
    { title: "-겠-", topic: "推測でしょう、だろう", modelContent: { theme: "-겠-", sentence: "지금 열 한 시니까 벌써 집을 떠났겠군요.", patterns: [{ pattern: "-겠-", example: "推測でしょう、だろう" }] } },
    { title: "-은 지 -가 되다", topic: "～してから (~ぐらい) 経つ", modelContent: { theme: "-은 지 -가 되다", sentence: "한국어를 시작한 지 3년이 됐는데 아직 잘 못해요.", patterns: [{ pattern: "-은 지 -가 되다", example: "～してから (~ぐらい) 経つ" }] } },
    { title: "-만", topic: "～ばかり", modelContent: { theme: "-만", sentence: "주말 내내 침대에 누워 있기만 했어요.", patterns: [{ pattern: "-만", example: "～ばかり" }] } },
    { title: "-을 테니까", topic: "(私が) ～するから", modelContent: { theme: "-을 테니까", sentence: "음료수는 제가 가져 올 테니까 걱정하지 마세요.", patterns: [{ pattern: "-을 테니까", example: "(私が) ～するから" }] } },
    { title: "-다가", topic: "～していて", modelContent: { theme: "-다가", sentence: "어렸을 때는 해외에서 살다가 중학교 때 돌아왔어요.", patterns: [{ pattern: "-다가", example: "～していて" }] } },
    { title: "-았/었군요", topic: "～たったのですね。", modelContent: { theme: "-았/었군요", sentence: "머리를 짧게 잘랐군요. 잘 어울리네요.", patterns: [{ pattern: "-았/었군요", example: "～たったのですね。" }] } },
    { title: "-도록 하다", topic: "～するようにする", modelContent: { theme: "-도록 하다", sentence: "이 약을 하루에 세 번 식후에 드시도록 하세요.", patterns: [{ pattern: "-도록 하다", example: "～するようにする" }] } },
    { title: "-(으)ㄹ래요?", topic: "～しませんか。", modelContent: { theme: "-(으)ㄹ래요?", sentence: "제가 회의 준비하는 동안 여기 정리 좀 해 줄래요?", patterns: [{ pattern: "-(으)ㄹ래요?", example: "～しませんか。" }] } },
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
