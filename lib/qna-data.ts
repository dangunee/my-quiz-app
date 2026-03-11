/**
 * Server-side data fetching for Q&A (kotae) and 생활한국어 (dailylife).
 * Used for ISR - pre-render at build/revalidate time.
 */
import { createClient } from "@supabase/supabase-js";
import { extractBodyIfFullDocument } from "./html-utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** 本文から「........」以降、または講座案内・書籍紹介などを除去 */
function stripFooter(content: string): string {
  if (!content || typeof content !== "string") return "";
  let cutIndex = -1;
  const dotMatch = content.match(/\.{4,}/);
  if (dotMatch) {
    const idx = content.indexOf(dotMatch[0]);
    if (idx >= 0 && (cutIndex < 0 || idx < cutIndex)) cutIndex = idx;
  }
  const dottedLineMatch = content.match(/[･・]{25,}/);
  if (dottedLineMatch) {
    const idx = content.indexOf(dottedLineMatch[0]);
    if (idx >= 0 && (cutIndex < 0 || idx < cutIndex)) cutIndex = idx;
  }
  if (cutIndex >= 0) return content.slice(0, cutIndex).trim();
  return content.trim();
}

export interface KotaeItem {
  id: number;
  title: string;
  url: string;
}

export interface KotaeContent {
  id: number;
  title: string;
  url: string;
  html: string;
}

export interface SeikatsuItem {
  title: string;
}

export interface SeikatsuContent {
  title: string;
  url: string;
  html: string;
}

export async function getKotaeList(): Promise<KotaeItem[]> {
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("qna_posts")
      .select("id, title, url")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("[qna-data]", error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      title: row.title ?? "",
      url: row.url ?? (typeof row.id === "number" ? `https://apps.mirinae.jp/qna/${row.id}` : ""),
    }));
  } catch (err) {
    console.error("[qna-data]", err);
    return [];
  }
}

export async function getKotaeContent(id: number): Promise<KotaeContent | null> {
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("qna_posts")
      .select("content, url, title")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const rawContent = data.content ?? "";
    const extracted = extractBodyIfFullDocument(rawContent);
    const html = stripFooter(extracted);
    const url = data.url ?? `https://apps.mirinae.jp/qna/${id}`;

    return {
      id,
      title: data.title ?? "",
      url,
      html,
    };
  } catch (err) {
    console.error("[qna-data]", err);
    return null;
  }
}

/** 最初の limit 件の Q&A 内容を一括取得（ISR用） */
export async function getKotaeListWithContents(limit = 20): Promise<{
  list: KotaeItem[];
  contents: KotaeContent[];
}> {
  const list = await getKotaeList();
  const contents: KotaeContent[] = [];
  const idsToFetch = list.slice(0, limit).map((i) => i.id);

  for (const id of idsToFetch) {
    const content = await getKotaeContent(id);
    if (content) contents.push(content);
  }

  return { list, contents };
}

export async function getSeikatsuList(): Promise<SeikatsuItem[]> {
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("seikatsu_items")
      .select("title")
      .order("sort_order", { ascending: false });

    if (error) {
      console.error("[qna-data]", error);
      return [];
    }

    return (data || []).map((r) => ({ title: r.title ?? "" }));
  } catch (err) {
    console.error("[qna-data]", err);
    return [];
  }
}

export async function getSeikatsuContent(title: string): Promise<SeikatsuContent | null> {
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("seikatsu_items")
      .select("content, url")
      .eq("title", title)
      .single();

    if (error || !data) return null;

    const html = extractBodyIfFullDocument(data.content ?? "");
    const url = data.url ?? "https://mirinae.jp/blog/";

    return { title, url, html };
  } catch (err) {
    console.error("[qna-data]", err);
    return null;
  }
}

/** 最初の limit 件の 생활한국어 内容を一括取得（ISR用） */
export async function getSeikatsuListWithContents(limit = 20): Promise<{
  list: SeikatsuItem[];
  contents: SeikatsuContent[];
}> {
  const list = await getSeikatsuList();
  const contents: SeikatsuContent[] = [];
  const titlesToFetch = list.slice(0, limit).map((i) => i.title);

  for (const title of titlesToFetch) {
    const content = await getSeikatsuContent(title);
    if (content) contents.push(content);
  }

  return { list, contents };
}
