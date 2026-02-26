// Default title and topic for 課題例 1期~8期 (10 items each)
export const DEFAULT_ASSIGNMENT_EXAMPLES: { title: string; topic: string }[][] = [
  [
    { title: "第1回課題：　テーマ：約束", topic: "約束" },
    { title: "第2回課題：　テーマ：季節", topic: "季節" },
    { title: "第3回課題：　テーマ：私の一日", topic: "私の一日" },
    { title: "第4回課題：　テーマ：ストレス解消法", topic: "ストレス解消法" },
    { title: "第5回課題：　テーマ：家族", topic: "家族" },
    { title: "第6回課題：　テーマ：旅行", topic: "旅行" },
    { title: "第7回課題：　テーマ：公演", topic: "公演" },
    { title: "第8回課題：　テーマ：友達", topic: "友達" },
    { title: "第9回課題：　テーマ：ダイエット・健康管理", topic: "ダイエット・健康管理" },
    { title: "第10回課題：　テーマ：インテリア", topic: "インテリア" },
  ],
  [
    { title: "第1回課題：　テーマ：同好会、集まり", topic: "同好会、集まり" },
    { title: "第2回課題：　テーマ：試験", topic: "試験" },
    { title: "第3回課題：　テーマ：健康、長寿", topic: "健康、長寿" },
    { title: "第4回課題：　テーマ：ニュース", topic: "ニュース" },
    { title: "第5回課題：　テーマ：習慣", topic: "習慣" },
    { title: "第6回課題：　テーマ：整形手術", topic: "整形手術" },
    { title: "第7回課題：　テーマ：就職", topic: "就職" },
    { title: "第8回課題：　テーマ：プレゼント", topic: "プレゼント" },
    { title: "第9回課題：　テーマ：韓国、韓国人", topic: "韓国、韓国人" },
    { title: "第10回課題：　テーマ：料理", topic: "料理" },
  ],
  [
    { title: "第1回課題：　テーマ：理想型", topic: "理想型" },
    { title: "第2回課題：　テーマ：ドラマ", topic: "ドラマ" },
    { title: "第3回課題：　テーマ：思い出", topic: "思い出" },
    { title: "第4回課題：　テーマ：服", topic: "服" },
    { title: "第5回課題：　テーマ：好きな食材と食べ方", topic: "好きな食材と食べ方" },
    { title: "第6回課題：　テーマ：ぞっとしたこと", topic: "ぞっとしたこと" },
    { title: "第7回課題：　テーマ：配達", topic: "配達" },
    { title: "第8回課題：　テーマ：癖", topic: "癖" },
    { title: "第9回課題：　テーマ：占い", topic: "占い" },
    { title: "第10回課題：　テーマ：公共秩序", topic: "公共秩序" },
  ],
  ...Array(5).fill(null).map(() => Array(10).fill(null).map(() => ({ title: "", topic: "" }))),
];

export const PERIOD_LABELS = ["1期", "2期", "3期", "4期", "5期", "6期", "7期", "8期"];
