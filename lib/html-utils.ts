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
 * EDITモード用: script/audio/オーディオプレイヤー全体を一時的に取り除き、編集可能な部分だけ返す。
 * オーディオプレイヤーは<audio>の前後の関連div（controls, progress等）も含めてブロックごと抽出。
 */
function extractBlockContainingAudio(html: string): { before: string; block: string; after: string } | null {
  const audioMatch = html.match(/<audio[\s\S]*?<\/audio>|<audio[^>]*\/\s*>/i);
  if (!audioMatch) return null;
  const audioStart = html.indexOf(audioMatch[0]);
  const audioEnd = audioStart + audioMatch[0].length;
  // <audio>の前の直近の<div, <figure, <section>からブロック開始を探す
  let blockStart = audioStart;
  const beforeAudio = html.substring(0, audioStart);
  const openTagMatch = beforeAudio.match(/<(div|figure|section)(\s[^>]*)?>[\s\S]*$/i);
  if (openTagMatch) {
    const tagName = openTagMatch[1].toLowerCase();
    const lastOpen = beforeAudio.lastIndexOf(`<${tagName}`);
    if (lastOpen >= 0) {
      const fragment = html.substring(lastOpen);
      let depth = 1;
      let pos = fragment.indexOf(">") + 1;
      const closeTag = `</${tagName}>`;
      while (depth > 0 && pos < fragment.length) {
        const nextClose = fragment.indexOf(closeTag, pos);
        if (nextClose < 0) break;
        const nextOpen = fragment.indexOf(`<${tagName}`, pos);
        if (nextOpen >= 0 && nextOpen < nextClose) {
          depth++;
          pos = nextOpen + tagName.length + 2;
        } else {
          depth--;
          if (depth === 0) {
            blockStart = lastOpen;
            const blockEnd = lastOpen + nextClose + closeTag.length;
            return {
              before: html.substring(0, blockStart),
              block: html.substring(blockStart, blockEnd),
              after: html.substring(blockEnd),
            };
          }
          pos = nextClose + closeTag.length;
        }
      }
    }
  }
  return null;
}

export function extractForEdit(html: string): { editable: string; preserved: string[] } {
  const preserved: string[] = [];
  const placeholder = (idx: number) => `<div contenteditable="false" data-edit-ph="${idx}" style="background:#f0f0f0;padding:4px 8px;margin:4px 0;font-size:12px;color:#666;">[音声・スクリプト ${idx + 1}]</div>`;
  let editable = html;

  editable = editable.replace(/<script[\s\S]*?<\/script>/gi, (m) => {
    preserved.push(m);
    return placeholder(preserved.length - 1);
  });

  // オーディオブロック全体を抽出（<audio>単体より親のdiv/figure/sectionごと）
  let extracted = extractBlockContainingAudio(editable);
  while (extracted) {
    preserved.push(extracted.block);
    editable = extracted.before + placeholder(preserved.length - 1) + extracted.after;
    extracted = extractBlockContainingAudio(editable);
  }

  // 上記で拾えなかった単体の<audio>
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
