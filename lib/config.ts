/**
 * ミリネ本サイトURL（講座・申込等）
 * 環境変数 NEXT_PUBLIC_MIRINAE_JP で上書き可能。
 * 例: www.mirinae.jp に移行する際は .env に NEXT_PUBLIC_MIRINAE_JP=https://www.mirinae.jp を設定
 */
export const MIRINAE_JP =
  process.env.NEXT_PUBLIC_MIRINAE_JP || "https://mirinae-jp.vercel.app";
