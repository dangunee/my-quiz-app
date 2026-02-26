// 音読課題 課題シート・発音抑揚シート用データ
// 初中級 1-4期, 中上級 1-4期 (各8項目)

export type AssignmentSheetItem = {
  bunkei: string; // 文型
  kadai: string; // 課題
  wakaku: string; // 和訳
  point: string; // ポイント
};

export type PronunciationSheetItem = {
  kadaiSpaced: string; // 課題（区切り付き）
  correctPronunciation: string; // 正しい発音
  commentary?: string; // 解説
};

export type OndokuAssignmentItem = {
  sheet: AssignmentSheetItem;
  pronunciation?: PronunciationSheetItem;
};

// 初中級 1期 (period 0) - 8項目
const CHUJOKYU_1KI: OndokuAssignmentItem[] = [
  { sheet: { bunkei: "-겠- 推測でしょう、だろう", kadai: "지금 열 한 시니까 벌써 집을 떠났겠군요.", wakaku: "今11時だからもう家を出たでしょう。", point: "推測の表現" } },
  { sheet: { bunkei: "-은 지 -가 되다 ～してから (~ぐらい) 経つ", kadai: "한국어를 시작한 지 3년이 됐는데 아직 잘 못해요.", wakaku: "韓国語を始めてから3年になりますがまだ上手くできません。", point: "-은 지 の発音" } },
  { sheet: { bunkei: "-만 ～ばかり", kadai: "주말 내내 침대에 누워 있기만 했어요.", wakaku: "週末ずっとベッドに横になっているばかりでした。", point: "만 のリズム" } },
  { sheet: { bunkei: "-을 테니까 (私が) ～するから", kadai: "음료수는 제가 가져 올 테니까 걱정하지 마세요.", wakaku: "飲み物は私が持ってきますから心配しないでください。", point: "테니까 の縮約" } },
  { sheet: { bunkei: "-다가 ～していて", kadai: "어렸을 때는 해외에서 살다가 중학교 때 돌아왔어요.", wakaku: "子供の頃は海外で暮らしていて中学の時に帰ってきました。", point: "다가 の連音" } },
  { sheet: { bunkei: "-았/었군요 ～たったのですね。", kadai: "머리를 짧게 잘랐군요. 잘 어울리네요.", wakaku: "髪を短く切ったのですね。よく似合いますね。", point: "군요 の抑揚" } },
  { sheet: { bunkei: "-도록 하다 ～するようにする", kadai: "이 약을 하루에 세 번 식후에 드시도록 하세요.", wakaku: "この薬を1日3回食後に飲むようにしてください。", point: "도록 のㄹパッチム" } },
  { sheet: { bunkei: "-(으)ㄹ래요? ～しませんか。", kadai: "제가 회의 준비하는 동안 여기 정리 좀 해 줄래요?", wakaku: "私が会議の準備をしている間、ここを片付けてくれませんか？", point: "줄래요 の縮約" } },
];

// 初中級 2期 (period 1) - 第6回のPDF内容を反映
const CHUJOKYU_2KI: OndokuAssignmentItem[] = [
  { sheet: { bunkei: "-냐고 하다 ～かという・聞く", kadai: "이 엽서에 우표를 붙일 거냐고 했어요.", wakaku: "この葉書に切手を貼るんですかと言いました。", point: "엽써濃音、부칠꺼냐고 口蓋音" }, pronunciation: { kadaiSpaced: "이 엽서에 우표를 붙일 거냐고 했어요", correctPronunciation: "이 엽써에 우표를 부칠꺼냐고 해써요", commentary: "ㄹ받침 뒤에 이어지는 濃音도 잘 읽으셨습니다." } },
  { sheet: { bunkei: "-대요 ～だそうです。", kadai: "올여름에 애인과 헤어져서 외로웠대요.", wakaku: "今年の夏に恋人と別れて寂しかったんですって。", point: "올려르메 ㄴ挿入後流音・連音化、 웨로웓때요" }, pronunciation: { kadaiSpaced: "올여름에 애인과 헤어져서 외로웠대요", correctPronunciation: "올려르메 애인과 헤어져서 웨로웓때요", commentary: "첫소리 억양이 높았습니다." } },
  { sheet: { bunkei: "-(으)ㄹ 거래요 ～つもり・予定だそうです。", kadai: "오늘 멀리 사는 딸이 올 거래요.", wakaku: "今日は離れて暮らす娘が来るんですって。", point: "올꺼래요 ㄹ後濃音" }, pronunciation: { kadaiSpaced: "오늘 멀리 사는 딸이 올 거래요", correctPronunciation: "오늘 멀리사는 따리 올꺼래요", commentary: "ㄹ받침을 정확히 있는 것은 좋았는데 멀~을 너무 늘려서 받침 발음을 유지하면서 조금씩 텀이 너무 길어지지 않도록 연습해봅시다." } },
  { sheet: { bunkei: "-아/어야 할 텐데 ~すればいいのに・～しなければならないのに", kadai: "이번 시험은 잘 봐야 할 텐데 자신이 없어요.", wakaku: "今回のテストは良い点数を取らなきゃいけないはずなのに自信がないです。", point: "시어믄 ㅎ無音、連音" }, pronunciation: { kadaiSpaced: "이번 시험은 잘 봐야 할 텐데 자신이 없어요", correctPronunciation: "이번시어믄 잘 봐야 할텐데 자시니 업써요", commentary: "잘 읽으셨습니다. 걱정의 뉘앙스를 살리면서 다시 한번 읽어봅시다." } },
  { sheet: { bunkei: "-아/어 보니까 ~てみたら", kadai: "옷을 입어 보니까 허리가 딱 맞네요.", wakaku: "服を着てみたら腰がぴったりですね。", point: "連音、땅 만네요 鼻音" }, pronunciation: { kadaiSpaced: "옷을 입어 보니까 허리가 딱 맞네요", correctPronunciation: "오슬 이버보니까 허리가 땅만네요", commentary: "딱[땅] 鼻音발음으로 읽는 부분도 자연스럽게 잘 읽으셨습니다." } },
  { sheet: { bunkei: "어디나 どこも", kadai: "세계 어디나 테러 문제는 골칫거리다.", wakaku: "世界中のどこでもテロ問題は悩みの種です。", point: "골칟꺼리다 代表音・濃音" }, pronunciation: { kadaiSpaced: "세계 어디나 테러 문제는 골칫거리다", correctPronunciation: "세계 어디나 테러문제는 골칟꺼리다", commentary: "激音, 濃音, 받침 전체적으로 아주 잘 읽으셨습니다." } },
  { sheet: { bunkei: "-(으)ㄹ 수 있을지 걱정이다 ～かどうか心配だ", kadai: "이번에 일본 요리 자격증을 딸 수 있을지 걱정입니다.", wakaku: "今回、日本料理の資格を取れるのか心配です。", point: "이버네 連音、일본뇨리 ㄴ挿入、자격쯩을 濃音、딸쑤이쓸찌 ㄹ後濃音" }, pronunciation: { kadaiSpaced: "이번에 일본 요리 자격증을 딸 수 있을지 걱정입니다", correctPronunciation: "이버네 일본뇨리 자격쯩을 딸쑤이쓸찌 걱쩡임니다", commentary: "잘 읽으셨습니다. 전체적으로 이어서 다시 한번 읽어봅시다." } },
  { sheet: { bunkei: "-(으)ㄴ 지 얼마 안 됐다 ～て間もない", kadai: "염색한 지 얼마 안 됐는데 흰머리가 눈에 띄네요.", wakaku: "髪を染めてからそんなに経ってないのに白髪が目立つんですよね。", point: "염색한激音、됐는데鼻音、흰머리, 띄네요の発音" }, pronunciation: { kadaiSpaced: "염색한지 얼마 안 됐는데 흰머리가 눈에 띄네요", correctPronunciation: "염새칸지 얼마 안뒌는데 힌머리가 누네띠네요", commentary: "끊는 부분에 억양이 너무 높고 그렇게 끊는 부분이 많습니다. 끊는 부분은 너무 많지 않은 것이 자연스럽습니다." } },
];

// 初中級 3期・4期 - 既存データから生成
const CHUJOKYU_3KI: OndokuAssignmentItem[] = [
  { sheet: { bunkei: "政治", kadai: "한국의 경제가 빠르게 성장하고 있습니다.", wakaku: "韓国の経済が急速に成長しています。", point: "長文の抑揚" } },
  { sheet: { bunkei: "経済", kadai: "물가가 올라가서 생활비가 부담돼요.", wakaku: "物価が上がって生活費が負担です。", point: "連音" } },
  { sheet: { bunkei: "文化", kadai: "한국의 전통 음식인 김치를 만들어 봤어요.", wakaku: "韓国の伝統料理であるキムチを作ってみました。", point: "濃音" } },
  { sheet: { bunkei: "文化", kadai: "설날에 떡국을 먹는 것이 한국의 풍습이에요.", wakaku: "旧正月にトッククを食べるのが韓国の風習です。", point: "ㄱパッチム" } },
  { sheet: { bunkei: "ドラマ", kadai: "최근에 본 드라마가 너무 재미있었어요.", wakaku: "最近見たドラマがとても面白かったです。", point: "激音" } },
  { sheet: { bunkei: "ドラマ", kadai: "주인공의 대사가 인상적이었어요.", wakaku: "主人公の台詞が印象的でした。", point: "二重パッチム" } },
  { sheet: { bunkei: "日常会話", kadai: "오늘 회의가 있어서 바쁠 것 같아요.", wakaku: "今日会議があるので忙しいかもしれません。", point: "リズム" } },
  { sheet: { bunkei: "日常会話", kadai: "주말에 친구들이랑 영화를 보기로 했어요.", wakaku: "週末に友達と映画を見ることにしました。", point: "ㄹの発音" } },
];

const CHUJOKYU_4KI: OndokuAssignmentItem[] = Array.from({ length: 8 }, (_, i) => ({
  sheet: {
    bunkei: "政治分野",
    kadai: `音読課題 4期 政治 ${i + 1}回目。課題文を声に出して読んでください。`,
    wakaku: `音読課題4期政治${i + 1}回目。`,
    point: "発音・抑揚・リズムに注意",
  },
}));

// 中上級 1-4期 (period 4-7)
const CHUUJOKYU_BASE = (field: string, start: number) =>
  Array.from({ length: 8 }, (_, i) => ({
    sheet: {
      bunkei: `${field}分野`,
      kadai: `音読課題 中上級 ${field} ${start + i}回目。課題文を声に出して読んでください。`,
      wakaku: `音読課題中上級${field}${start + i}回目。`,
      point: "発音・抑揚・リズムに注意して読んでください。",
    } as AssignmentSheetItem,
  } as OndokuAssignmentItem));

export const ONDOKU_ASSIGNMENT_SHEETS = {
  chujokyu: [CHUJOKYU_1KI, CHUJOKYU_2KI, CHUJOKYU_3KI, CHUJOKYU_4KI],
  chuujokyu: [
    CHUUJOKYU_BASE("政治", 1),
    CHUUJOKYU_BASE("経済", 1),
    CHUUJOKYU_BASE("文化", 1),
    CHUUJOKYU_BASE("ドラマ", 1),
  ],
};

// 模範音声 URL (管理画面で設定可能にする場合はAPI経由に変更)
export type ModelAudioUrls = {
  fast?: string;
  slow?: string;
};

export const ONDOKU_MODEL_AUDIO_DEFAULTS: Record<string, Record<number, ModelAudioUrls>> = {
  chujokyu: { 0: {}, 1: {}, 2: {}, 3: {} },
  chuujokyu: { 0: {}, 1: {}, 2: {}, 3: {} },
};
