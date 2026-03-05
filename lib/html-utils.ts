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
