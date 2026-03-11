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
  let trimmed = html.trim();
  if (!trimmed) return "";
  // 完全なHTML文書の場合はbody内容のみ抽出（ネスト防止）
  if (/<!DOCTYPE\s+html/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) {
    trimmed = extractBodyIfFullDocument(trimmed);
  }
  const baseStyle = `<style>html,body{margin:0;padding:0;box-sizing:border-box}*{box-sizing:border-box}</style>`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${baseStyle}</head><body>${trimmed}</body></html>`;
}

/**
 * EDITモード用: script/audioを含むブロックを一時的に取り除き、編集可能な部分だけ返す。
 * オーディオプレーヤーのUI（divでラップされたコントロール等）も含めてブロックごと置換。
 * 取り除いた部分はプレースホルダに置換し、preservedに格納。保存時にmergeForSaveで復元。
 */
export function extractForEdit(html: string): { editable: string; preserved: string[] } {
  const preserved: string[] = [];
  const placeholder = (idx: number) => `<div contenteditable="false" data-edit-ph="${idx}" style="background:#f0f0f0;padding:4px 8px;margin:4px 0;font-size:12px;color:#666;">[音声・スクリプト ${idx + 1}]</div>`;

  if (typeof window === "undefined") {
    return extractForEditRegex(html, preserved, placeholder);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const root = doc.body;

  const toReplace: { element: Element; originalHtml: string }[] = [];
  const seen = new WeakSet<Element>();

  root.querySelectorAll("audio").forEach((audio) => {
    const block = audio.closest("div");
    const el = block || audio;
    if (seen.has(el)) return;
    seen.add(el);
    toReplace.push({ element: el, originalHtml: el.outerHTML });
  });

  root.querySelectorAll("script").forEach((script) => {
    if (seen.has(script)) return;
    const block = script.closest("div");
    const el = block || script;
    if (seen.has(el)) return;
    seen.add(el);
    toReplace.push({ element: el, originalHtml: el.outerHTML });
  });

  toReplace.sort((a, b) => (a.element.contains(b.element) ? 1 : b.element.contains(a.element) ? -1 : 0));

  toReplace.forEach(({ element, originalHtml }) => {
    if (!element.parentNode) return;
    const idx = preserved.length;
    preserved.push(originalHtml);
    const ph = doc.createElement("div");
    ph.setAttribute("contenteditable", "false");
    ph.setAttribute("data-edit-ph", String(idx));
    ph.style.cssText = "background:#f0f0f0;padding:4px 8px;margin:4px 0;font-size:12px;color:#666;";
    ph.textContent = `[音声・スクリプト ${idx + 1}]`;
    element.parentNode.replaceChild(ph, element);
  });

  return { editable: root.innerHTML, preserved };
}

function extractForEditRegex(html: string, preserved: string[], placeholder: (i: number) => string): { editable: string; preserved: string[] } {
  let editable = html;
  editable = editable.replace(/<script[\s\S]*?<\/script>/gi, (m) => {
    preserved.push(m);
    return placeholder(preserved.length - 1);
  });
  editable = editable.replace(/<audio[\s\S]*?<\/audio>|<audio[^>]*\/\s*>/gi, (m) => {
    preserved.push(m);
    return placeholder(preserved.length - 1);
  });
  return { editable, preserved };
}

/**
 * EDITモードで保存時、プレースホルダをpreservedの内容で置換して復元。
 */
export function mergeForSave(editedHtml: string, preserved: string[]): string {
  let result = editedHtml;
  preserved.forEach((p, i) => {
    const ph = new RegExp(`<div[^>]*data-edit-ph="${i}"[^>]*>[^<]*</div>`, "i");
    result = result.replace(ph, p);
  });
  return result;
}

/**
 * HTML 내 img 태그 최적화: loading="lazy", decoding="async" 추가.
 * 답변에 이미지가 있다면 WebP 사용을 권장 (업로드 시 변환).
 */
export function optimizeImagesInHtml(html: string): string {
  if (!html || typeof html !== "string") return html;
  return html.replace(/<img([^>]*?)>/gi, (match, attrs) => {
    let newAttrs = attrs;
    if (!/loading\s*=/i.test(newAttrs)) newAttrs += ' loading="lazy"';
    if (!/decoding\s*=/i.test(newAttrs)) newAttrs += ' decoding="async"';
    return `<img${newAttrs}>`;
  });
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
