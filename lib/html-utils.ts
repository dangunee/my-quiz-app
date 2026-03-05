/**
 * 完全なHTML文書（<!DOCTYPE>, <html>, <head>, <body> を含む）の場合、
 * <head> の <style> と <body> 内のコンテンツを抽出する。
 * file:// で開くと正しく表示されるが、div に innerHTML で挿入すると
 * ソースがそのまま表示される問題を解消する。
 */
export function extractBodyIfFullDocument(html: string): string {
  if (!html || typeof html !== "string") return html;
  const trimmed = html.trim();
  if (!trimmed) return html;

  // 完全なHTML文書かどうか（<!DOCTYPE> または <html を含む）
  if (!/<!DOCTYPE\s+html/i.test(trimmed) && !/<html[\s>]/i.test(trimmed)) {
    return trimmed;
  }

  let result = "";

  // <head> 内の <style> を抽出（body の前に配置）
  const headMatch = trimmed.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (headMatch) {
    const styleMatches = headMatch[1].match(/<style[^>]*>[\s\S]*?<\/style>/gi);
    if (styleMatches) {
      result += styleMatches.join("\n");
    }
  }

  const bodyMatch = trimmed.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    result += (result ? "\n" : "") + bodyMatch[1].trim();
  }

  return result || trimmed;
}

/**
 * HTML 내 긴 data: URL(Base64 이미지/오디오 등) 제거.
 * paste 시 본문에 끼어드는 이상한 문자열 방지.
 */
export function stripLongDataUrls(html: string): string {
  if (!html || typeof html !== "string") return html;
  return html.replace(/(src|href)=["'](data:[^"']{300,})["']/gi, '$1=""');
}
