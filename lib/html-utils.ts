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
 * HTML에 <script>가 포함된 경우 iframe srcdoc로 렌더링할 수 있도록
 * 전체 문서로 감싼다. (innerHTML로 삽입하면 script가 실행되지 않음)
 */
export function wrapHtmlForIframe(html: string): string {
  if (!html || typeof html !== "string") return "";
  const trimmed = html.trim();
  if (!trimmed) return "";
  const fullWidthStyle = `<style>html,body{width:100%!important;max-width:none!important;margin:0;padding:0;box-sizing:border-box}body>*{max-width:none!important;width:100%!important;box-sizing:border-box}</style>`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${fullWidthStyle}</head><body>${trimmed}</body></html>`;
}

/**
 * HTML 내 긴 data: URL(Base64 이미지/오디오 등) 및 의미 없는 긴 문자열 제거.
 * paste 시 본문에 끼어드는 이상한 문자열 방지.
 */
export function stripLongDataUrls(html: string): string {
  if (!html || typeof html !== "string") return html;
  let out = html;
  // src, href 속성의 data: URL
  out = out.replace(/(src|href)=["'](data:[^"']{300,})["']/gi, '$1=""');
  // style 내 url(data:...)
  out = out.replace(/url\(["']?(data:[^"')]{300,})["']?\)/gi, 'url("")');
  // 속성값이 아닌 곳에 끼어든 data: URL (태그 밖 등)
  out = out.replace(/data:[^"'\s<>)]{300,}/gi, "");
  // base64 인코딩만 남은 긴 문자열 (data: 접두사 없이, 속성/태그 내부가 아닌 곳)
  out = out.replace(/(^|[^A-Za-z0-9+/=])([A-Za-z0-9+/=]{500,})($|[^A-Za-z0-9+/=])/g, "$1$3");
  return out;
}
