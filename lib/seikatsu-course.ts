/**
 * 講座案内（강좌 광고 안내）判定・本文の切り詰め
 * 開講日程・時間・「300~500字作文」などの下は保存・表示しない
 */

export function isCourseAnnouncement(title: string, content: string): boolean {
  const t = (title + " " + content).replace(/\s+/g, " ");
  return (
    /ご案内/.test(t) ||
    /講座/.test(t) ||
    /体験受付/.test(t) ||
    /開講/.test(t) ||
    /メールで作文トレーニング/.test(t) ||
    /トレーニング\s*[>」]/.test(t)
  );
}

export function truncateCourseAnnouncementContent(html: string): string {
  if (!html || typeof html !== "string") return "";
  let cutIndex = -1;
  const m1 = html.indexOf("開講日程");
  if (m1 >= 0) cutIndex = cutIndex === -1 ? m1 : Math.min(cutIndex, m1);
  const timeSection = html.match(/\s時間\s*[：:]/);
  if (timeSection && timeSection.index != null) {
    const idx = timeSection.index;
    cutIndex = cutIndex === -1 ? idx : Math.min(cutIndex, idx);
  }
  const m2 = html.indexOf("300~500字");
  if (m2 >= 0) cutIndex = cutIndex === -1 ? m2 : Math.min(cutIndex, m2);
  const m3 = html.indexOf("字作文");
  if (m3 >= 0) cutIndex = cutIndex === -1 ? m3 : Math.min(cutIndex, m3);

  if (cutIndex > 0) {
    return html.slice(0, cutIndex).replace(/\s*<[^>]+>\s*$/, "").trim();
  }
  return html.trim();
}
