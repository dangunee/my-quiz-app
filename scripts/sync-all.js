#!/usr/bin/env node
/**
 * Q&A + 生活韓国語 동기화 스크립트
 * 사용: node scripts/sync-all.js
 * .env.local의 환경변수 필요 (dotenv 로드)
 */

const WP_API = "https://mirinae.jp/blog/index.php?rest_route=/wp/v2/posts";

function decodeTitle(raw) {
  return raw.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 10))
  );
}

async function fetchWpPosts(catId) {
  const all = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const url = `${WP_API}&categories=${catId}&per_page=100&page=${page}&_fields=id,title,content,link`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; QuizApp/1.0)" },
    });
    if (!res.ok) throw new Error(`WP API failed: ${res.status}`);
    const posts = await res.json();
    if (posts.length === 0) break;
    for (const p of posts) {
      const title = decodeTitle(p.title?.rendered ?? "").trim();
      if (!title) continue;
      all.push({
        id: p.id,
        title,
        content: (p.content?.rendered ?? "").trim(),
        url: p.link ?? `https://mirinae.jp/blog/?p=${p.id}`,
      });
    }
    if (posts.length < 100) hasMore = false;
    else page++;
  }
  return all;
}

async function main() {
  const path = require("path");
  const fs = require("fs");
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요");
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("1. Q&A (cat=7) 동기화 중...");
  const qnaPosts = await fetchWpPosts("7");
  const qnaRows = qnaPosts.map((item, i) => ({
    id: item.id,
    title: item.title,
    content: item.content || null,
    url: item.url || null,
    sort_order: qnaPosts.length - i,
  }));
  const { error: qnaErr } = await supabase.from("qna_posts").upsert(qnaRows, { onConflict: "id" });
  if (qnaErr) {
    console.error("Q&A sync 실패:", qnaErr.message);
    process.exit(1);
  }
  console.log(`   Q&A: ${qnaRows.length}건 완료`);

  console.log("2. 生活韓国語 (cat=2) 동기화 중...");
  const seikatsuPosts = await fetchWpPosts("2");
  const { data: existing } = await supabase.from("seikatsu_items").select("id");
  if (existing?.length > 0) {
    for (let i = 0; i < existing.length; i += 100) {
      const chunk = existing.slice(i, i + 100).map((r) => r.id);
      await supabase.from("seikatsu_items").delete().in("id", chunk);
    }
  }
  const seikatsuRows = seikatsuPosts.map((item, i) => ({
    title: item.title,
    sort_order: seikatsuPosts.length - i,
    content: item.content || null,
    url: item.url || null,
    wp_id: item.id,
  }));
  const { error: seikatsuErr } = await supabase.from("seikatsu_items").insert(seikatsuRows);
  if (seikatsuErr) {
    console.error("生活韓国語 sync 실패:", seikatsuErr.message);
    process.exit(1);
  }
  console.log(`   生活韓国語: ${seikatsuRows.length}건 완료`);

  console.log("\n모든 동기화 완료.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
