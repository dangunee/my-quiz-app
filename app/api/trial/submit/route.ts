import { NextRequest, NextResponse } from "next/server";

const FORMSUBMIT_AJAX = "https://formsubmit.co/ajax/mirinae@kaonnuri.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, furigana, age, prefecture, koreanLevel, email } = body;

    const payload = {
      _subject: `お申込み（作文アプリ）`,
      _replyto: email,
      お名前: name,
      ふりがな: furigana,
      年齢: age,
      都道府県: prefecture,
      韓国語レベル: koreanLevel,
      メールアドレス: email,
    };

    const res = await fetch(FORMSUBMIT_AJAX, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("FormSubmit error:", res.status, text);
      return NextResponse.json(
        { error: "送信に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("trial submit error:", e);
    return NextResponse.json(
      { error: "送信に失敗しました" },
      { status: 500 }
    );
  }
}
