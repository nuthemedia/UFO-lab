import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const sourcesPath = resolve(rootDir, "data/keyhoe/sources.json");
const outputPath = resolve(rootDir, "public/data/keyhoe-today.json");
const dryRun = process.argv.includes("--dry");
const mockMode = process.argv.includes("--mock");
const openAiApiKey = process.env.OPENAI_API_KEY || "";
const openAiModel = process.env.OPENAI_KEYHOE_MODEL || "gpt-5-mini";
const redditClientId = process.env.REDDIT_CLIENT_ID || "";
const redditClientSecret = process.env.REDDIT_CLIENT_SECRET || "";
const redditUserAgent = process.env.REDDIT_USER_AGENT || "web:keyhoe:v0.5 (by UFO Lab Tokyo)";
const openAiTimeoutMs = 90_000;
const now = new Date();
const maxItems = 30;
const aiScoreThreshold = 7;
const aiFillThreshold = 6;
const categoryTargets = {
  official: 3,
  news: 9,
  buzz: 5,
};
const categoryMinimums = {
  official: 1,
  news: 6,
  buzz: 5,
};
const categorySourceCaps = {
  official: 3,
};
const defaultLookbackDays = {
  official: 90,
  news: 30,
  buzz: 30,
};
const maxSearchItemsPerSource = 6;

const mockData = {
  generatedAt: now.toISOString(),
  sourceMode: "mock",
  overallSummary: [
    "公式機関から大きな新発表はなく、議会・情報公開まわりの発言が中心です。",
    "専門メディアでは、過去資料の再検証と今後の公聴会への関心が続いています。",
    "Redditでは新しい映像投稿が注目されていますが、一次情報はまだ確認されていません。",
  ],
  items: [
    {
      id: "mock-aaro-update",
      title: "AAROが最新ページを更新、既存資料への導線を整理",
      summaryJa:
        "AAROの公開ページで、UAP関連資料へのリンク整理が行われたと見られます。新しい結論や大きな発表ではありませんが、公式情報を確認する入口として重要です。",
      detailJa:
        "AAROは米国防総省系のUAP調査窓口で、公式資料の導線や公開ページの変更は後続の報道や調査の参照点になります。今回のモックでは大きな新発表ではなく、公式情報を確認する入口として扱っています。実データ生成時はレポート、リリース、資料ページなどカード化できる更新だけを表示します。",
      sourceName: "AARO",
      category: "official",
      categoryLabel: "🇺🇸政府公式",
      importanceScore: 8,
      importanceLabel: "重要",
      whyItMattersJa: "一次情報の導線が変わると、今後の資料確認や報道引用に影響します。",
      reliabilityLabel: "高",
      cautionNote: "モックデータです。実装後は公式ページの更新日時を確認します。",
      originalUrl: "https://www.aaro.mil/",
      publishedAt: now.toISOString(),
    },
  ],
};

async function main() {
  if (mockMode) {
    await outputJson(mockData);
    return;
  }

  const sources = JSON.parse(await readFile(sourcesPath, "utf8"));
  const rawItems = [
    ...(await fetchRssSources(sources.news || [])),
    ...(await fetchOfficialSources(sources.official || [])),
    ...(await fetchRedditSources(sources.reddit || [])),
  ];

  const dedupedItems = selectDisplayItems(rawItems, { broad: Boolean(openAiApiKey) });
  const enriched = openAiApiKey
    ? await enrichWithOpenAi(dedupedItems).catch((error) => {
        console.warn(`OpenAI enrichment failed; using fallback: ${error.message}`);
        return fallbackEnrich(dedupedItems);
      })
    : fallbackEnrich(dedupedItems);

  const output = {
    generatedAt: now.toISOString(),
    sourceMode:
      openAiApiKey && enriched.items.some((item) => item.selectionMode === "ai") ? "live-ai" : "live-fallback",
    overallSummary: enriched.overallSummary,
    items: ensureUniqueHeadlines(sortItemsForDisplay(trimToMaxWithMinimums(applySourceCaps(enriched.items)))),
  };

  await outputJson(output);
}

async function outputJson(data) {
  const text = `${JSON.stringify(data, null, 2)}\n`;

  if (dryRun) {
    process.stdout.write(text);
    return;
  }

  await writeFile(outputPath, text, "utf8");
  console.log(`Wrote ${outputPath}`);
}

async function fetchRssSources(sources) {
  const items = [];

  for (const source of sources) {
    const feedUrls = await discoverFeedUrls(source);

    for (const feedUrl of feedUrls) {
      try {
        const xml = await fetchText(feedUrl);
        const parsedItems = parseFeed(xml).map((item) => normalizeFeedItem(item, source, feedUrl));
        items.push(...parsedItems);
        break;
      } catch (error) {
        console.warn(`Feed failed: ${source.name} ${feedUrl} ${error.message}`);
      }
    }

    items.push(...(await fetchSearchPageItems(source)));
  }

  return items.filter(Boolean);
}

async function fetchSearchPageItems(source) {
  const items = [];

  for (const searchUrl of source.searchUrls || []) {
    try {
      const html = await fetchText(searchUrl);
      items.push(...extractArticleLinks(html, source, searchUrl));
    } catch (error) {
      console.warn(`Search page failed: ${source.name} ${searchUrl} ${error.message}`);
    }
  }

  return dedupeItems(items)
    .sort((left, right) => scoreItem(right) - scoreItem(left))
    .slice(0, maxSearchItemsPerSource);
}

async function fetchOfficialSources(sources) {
  const items = [];

  for (const source of sources) {
    items.push(...normalizeManualItems(source));
    items.push(...(await fetchOfficialFeedItems(source)));
    items.push(...(await fetchSearchPageItems(source)));
  }

  return items.filter((item) => item.originalUrl !== item.sourceHomeUrl);
}

async function fetchOfficialFeedItems(source) {
  const items = [];

  for (const feedUrl of source.feedUrls || []) {
    try {
      const xml = await fetchText(feedUrl);
      items.push(...parseFeed(xml).map((item) => normalizeFeedItem(item, source, feedUrl, "official")));
      break;
    } catch (error) {
      console.warn(`Official feed failed: ${source.name} ${feedUrl} ${error.message}`);
    }
  }

  return items;
}

async function fetchRedditSources(sources) {
  const items = [];
  const token = await getRedditAccessToken();

  for (const source of sources) {
    if (source.enabled === false) {
      console.warn(`Reddit skipped: r/${source.subreddit} ${source.disabledReason || "disabled"}`);
      continue;
    }

    if (token) {
      items.push(...(await fetchRedditOauthItems(source, token)));
      continue;
    }

    console.warn(`Reddit OAuth env missing; using RSS fallback for r/${source.subreddit}`);
    items.push(...(await fetchRedditRssItems(source)));
    items.push(...(await fetchRedditPublicJsonItems(source)));
  }

  return items.filter(isWithinDisplayWindow);
}

async function getRedditAccessToken() {
  if (!redditClientId || !redditClientSecret) {
    return "";
  }

  try {
    const credentials = Buffer.from(`${redditClientId}:${redditClientSecret}`).toString("base64");
    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": redditUserAgent,
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return json.access_token || "";
  } catch (error) {
    console.warn(`Reddit OAuth failed; using RSS fallback: ${error.message}`);
    return "";
  }
}

async function fetchRedditOauthItems(source, token) {
  const items = [];
  const listings = [
    { sort: "hot", suffix: "hot.json?limit=20" },
    { sort: "new", suffix: "new.json?limit=20" },
    { sort: "top-day", suffix: "top.json?t=day&limit=20" },
    { sort: "top-week", suffix: "top.json?t=week&limit=20" },
  ];

  for (const listing of listings) {
    const url = `https://oauth.reddit.com/r/${source.subreddit}/${listing.suffix}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": redditUserAgent,
        },
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const posts = json?.data?.children || [];
      items.push(...posts.map((post) => normalizeRedditPost(post?.data, source)).filter(Boolean));
    } catch (error) {
      console.warn(`Reddit failed: r/${source.subreddit} ${listing.sort} ${error.message}`);
    }
  }

  return items;
}

async function fetchRedditRssItems(source) {
  const items = [];
  const feedUrls = [
    `https://www.reddit.com/r/${source.subreddit}/hot.rss?limit=20`,
    `https://www.reddit.com/r/${source.subreddit}/new.rss?limit=20`,
    `https://www.reddit.com/r/${source.subreddit}/top.rss?t=day&limit=20`,
    `https://www.reddit.com/r/${source.subreddit}/top.rss?t=week&limit=20`,
  ];

  for (const feedUrl of feedUrls) {
    try {
      const xml = await fetchText(feedUrl);
      items.push(...parseFeed(xml).map((item) => normalizeRedditFeedItem(item, source, feedUrl)));
    } catch (error) {
      console.warn(`Reddit RSS failed: r/${source.subreddit} ${feedUrl} ${error.message}`);
    }
  }

  return items.filter(Boolean);
}

async function fetchRedditPublicJsonItems(source) {
  const items = [];
  const listings = [
    { sort: "hot", suffix: "hot.json?limit=20" },
    { sort: "new", suffix: "new.json?limit=20" },
    { sort: "top-day", suffix: "top.json?t=day&limit=20" },
    { sort: "top-week", suffix: "top.json?t=week&limit=20" },
  ];

  for (const listing of listings) {
    const url = `https://www.reddit.com/r/${source.subreddit}/${listing.suffix}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": redditUserAgent,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const posts = json?.data?.children || [];
      items.push(...posts.map((post) => normalizeRedditPost(post?.data, source)).filter(Boolean));
    } catch (error) {
      console.warn(`Reddit public JSON failed: r/${source.subreddit} ${listing.sort} ${error.message}`);
    }
  }

  return items;
}

async function discoverFeedUrls(source) {
  const explicitFeeds = source.feedUrls || [];
  const candidates = [
    ...explicitFeeds,
    new URL("/feed", source.url).toString(),
    new URL("/rss", source.url).toString(),
    new URL("/rss.xml", source.url).toString(),
    new URL("/atom.xml", source.url).toString(),
  ];

  try {
    const html = await fetchText(source.url);
    const discovered = [...html.matchAll(/<link[^>]+rel=["'][^"']*alternate[^"']*["'][^>]*>/gi)]
      .map((match) => {
        const href = match[0].match(/href=["']([^"']+)["']/i)?.[1];
        const type = match[0].match(/type=["']([^"']+)["']/i)?.[1] || "";

        if (!href || !/rss|atom|xml/i.test(type)) {
          return "";
        }

        return new URL(href, source.url).toString();
      })
      .filter(Boolean);

    candidates.unshift(...discovered);
  } catch (error) {
    console.warn(`Feed discovery failed: ${source.name} ${error.message}`);
  }

  return [...new Set(candidates)];
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "UFO Lab Tokyo Keyhoe local checker/0.5",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

function parseFeed(xml) {
  const rssItems = extractBlocks(xml, "item").map((block) => ({
    title: readTag(block, "title"),
    link: readTag(block, "link"),
    publishedAt: readTag(block, "pubDate") || readTag(block, "dc:date"),
    excerpt: readTag(block, "description") || readTag(block, "content:encoded"),
  }));

  if (rssItems.length) {
    return rssItems;
  }

  return extractBlocks(xml, "entry").map((block) => ({
    title: readTag(block, "title"),
    link: readAtomLink(block) || readTag(block, "link"),
    publishedAt: readTag(block, "updated") || readTag(block, "published"),
    excerpt: readTag(block, "summary") || readTag(block, "content"),
  }));
}

function extractBlocks(text, tag) {
  const blocks = [];
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  let match;

  while ((match = pattern.exec(text))) {
    blocks.push(match[1]);
  }

  return blocks;
}

function readTag(block, tag) {
  const escapedTag = tag.replace(":", "\\:");
  const match = block.match(new RegExp(`<${escapedTag}\\b[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`, "i"));
  return decodeHtml(stripTags(match?.[1] || "").trim());
}

function readAtomLink(block) {
  const alternate = block.match(/<link[^>]+rel=["']alternate["'][^>]+href=["']([^"']+)["'][^>]*>/i)?.[1];
  const first = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1];
  return alternate || first || "";
}

function normalizeFeedItem(item, source, feedUrl, sourceType = "news") {
  const url = item.link ? new URL(item.link, feedUrl).toString() : source.url;
  const title = item.title || source.name;
  const parsedDate = parseDate(item.publishedAt);

  return {
    id: stableId(`${source.id}:${url}:${title}`),
    title,
    excerpt: item.excerpt || title,
    sourceName: source.name,
    category: source.category,
    categoryLabel: source.categoryLabel,
    originalUrl: url,
    publishedAt: parsedDate || now.toISOString(),
    sourceType,
    sourceHomeUrl: source.url,
    publishedAtKnown: Boolean(parsedDate),
    collectionMethod: "feed",
    lookbackDays: source.lookbackDays,
    sourceKind: source.sourceKind,
  };
}

function extractArticleLinks(html, source, pageUrl) {
  const links = [];
  const pattern = /<a\b[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = pattern.exec(html))) {
    const href = match[1];
    const title = cleanLinkTitle(match[2]);

    if (!href || !title || title.length < 12) {
      continue;
    }

    const url = new URL(href, pageUrl).toString();

    if (!isLikelyArticleUrl(url, source)) {
      continue;
    }

    links.push({
      id: stableId(`${source.id}:${url}:${title}`),
      title,
      excerpt: title,
      sourceName: source.name,
      category: source.category,
      categoryLabel: source.categoryLabel,
      originalUrl: url,
      publishedAt: now.toISOString(),
      sourceType: source.category === "official" ? "official" : "news",
      sourceHomeUrl: source.url,
      publishedAtKnown: false,
      collectionMethod: "search",
      lookbackDays: source.lookbackDays,
      sourceKind: source.sourceKind,
    });
  }

  return dedupeItems(links);
}

function isLikelyArticleUrl(url, source) {
  try {
    const parsed = new URL(url);
    const sourceUrl = new URL(source.url);
    const path = parsed.pathname;
    const fullPath = `${parsed.pathname}${parsed.search}`;
    const trustedDomain = source.trustedDomain || sourceUrl.hostname;

    if (parsed.hostname.replace(/^www\./, "") !== trustedDomain.replace(/^www\./, "")) {
      return false;
    }

    if (path === "/" || path.includes("/tag/") || path.includes("/category/") || path.includes("/search")) {
      return false;
    }

    if (source.cardizeRules?.exclude?.some((pattern) => new RegExp(pattern, "i").test(fullPath))) {
      return false;
    }

    if (source.cardizeRules?.include?.length) {
      return source.cardizeRules.include.some((pattern) => new RegExp(pattern, "i").test(fullPath));
    }

    return /\/\d{4}\/|\/[a-z0-9-]{18,}\/?$/i.test(path);
  } catch {
    return false;
  }
}

function normalizeManualItems(source) {
  return (source.manualItems || []).map((item) => {
    const parsedDate = parseDate(item.publishedAt);
    const url = new URL(item.url, source.url).toString();

    return {
      id: stableId(`${source.id}:${url}:${item.title}`),
      title: item.title,
      excerpt: item.excerpt || item.title,
      sourceName: source.name,
      category: source.category,
      categoryLabel: source.categoryLabel,
      originalUrl: url,
      publishedAt: parsedDate || now.toISOString(),
      sourceType: source.category === "official" ? "official" : "news",
      sourceHomeUrl: source.url,
      publishedAtKnown: Boolean(parsedDate),
      collectionMethod: "official-document",
      lookbackDays: source.lookbackDays,
      sourceKind: source.sourceKind,
    };
  });
}

function normalizeRedditPost(post, source) {
  if (!post?.title || post.stickied) {
    return null;
  }

  const url = post.url_overridden_by_dest || `https://www.reddit.com${post.permalink || ""}`;

  return {
    id: stableId(`${source.id}:${post.id}`),
    title: post.title,
    excerpt: post.selftext || `${post.ups || 0} upvotes / ${post.num_comments || 0} comments`,
    sourceName: source.name,
    category: source.category,
    categoryLabel: source.categoryLabel,
    originalUrl: url,
    publishedAt: new Date((post.created_utc || Date.now() / 1000) * 1000).toISOString(),
    sourceType: "reddit",
    publishedAtKnown: true,
    collectionMethod: "reddit",
    scoreHint: Number(post.ups || 0) + Number(post.num_comments || 0) * 2,
    lookbackDays: source.lookbackDays,
    sourceKind: source.sourceKind,
  };
}

function normalizeRedditFeedItem(item, source, feedUrl) {
  const url = item.link ? new URL(item.link, feedUrl).toString() : `https://www.reddit.com/r/${source.subreddit}/`;
  const parsedDate = parseDate(item.publishedAt);

  return {
    id: stableId(`${source.id}:${url}:${item.title}`),
    title: item.title,
    excerpt: item.excerpt || item.title,
    sourceName: source.name,
    category: source.category,
    categoryLabel: source.categoryLabel,
    originalUrl: url,
    publishedAt: parsedDate || now.toISOString(),
    sourceType: "reddit",
    sourceHomeUrl: `https://www.reddit.com/r/${source.subreddit}/`,
    publishedAtKnown: Boolean(parsedDate),
    collectionMethod: "reddit-rss",
    lookbackDays: source.lookbackDays,
    sourceKind: source.sourceKind,
  };
}

function selectDisplayItems(items, options = {}) {
  const relevant = dedupeItems(items.filter((item) => isRelevant(item, options))).sort(
    (left, right) => scoreItem(right) - scoreItem(left),
  );
  const selected = [];

  for (const category of ["official", "news", "buzz"]) {
    const categoryItems = relevant.filter((item) => item.category === category);
    const target = categoryTargets[category] || 3;
    const chosen = chooseCategoryItems(categoryItems, target);
    selected.push(...chosen);
  }

  for (const item of relevant.filter(isWithinDisplayWindow)) {
    if (selected.length >= maxItems) {
      break;
    }

    if (!selected.some((candidate) => candidate.id === item.id)) {
      selected.push(withFreshness(item));
    }
  }

  return selected.slice(0, maxItems);
}

function isWithinDisplayWindow(item) {
  return !item.publishedAtKnown || hoursSince(item.publishedAt) <= 24 * getLookbackDays(item);
}

function chooseCategoryItems(items, limit) {
  const today = items.filter((item) => item.publishedAtKnown && hoursSince(item.publishedAt) <= 24);
  const withinWeek = items.filter((item) => item.publishedAtKnown && hoursSince(item.publishedAt) <= 24 * 7);
  const withinMonth = items.filter(
    (item) => !item.publishedAtKnown || hoursSince(item.publishedAt) <= 24 * getLookbackDays(item),
  );
  const candidates = today.length ? today : withinWeek.length ? withinWeek : withinMonth;

  return candidates.slice(0, limit).map(withFreshness);
}

function withFreshness(item) {
  const isToday = item.publishedAtKnown && hoursSince(item.publishedAt) <= 24;
  const freshnessLabel = isToday
    ? "今日"
    : item.category === "official"
      ? item.publishedAtKnown
        ? "最近の公式更新"
        : "公式資料"
      : item.category === "buzz"
        ? "最近の話題"
        : "最近の更新";
  const collectionNote =
    item.collectionMethod === "search"
      ? "検索ページから取得したため、公開日は元記事で確認してください。"
      : item.collectionMethod === "official-document" || item.category === "official"
        ? "公式ソースの資料・リリースとして取得しました。"
        : item.sourceType === "reddit"
          ? "Reddit由来の話題です。未確認情報として扱います。"
        : "";

  return {
    ...item,
    freshnessLabel,
    collectionNote,
  };
}

function isRelevant(item, options = {}) {
  const haystack = `${item.title} ${item.excerpt}`.toLowerCase();
  const hasUapSignal = hasUapRelevanceSignal(haystack);

  if (item.sourceType === "official") {
    return hasUapSignal || /\brecords?\b|\btransparency\b/.test(haystack);
  }

  if (item.sourceType === "reddit") {
    return true;
  }

  if (options.broad) {
    return hasUapSignal;
  }

  return hasUapRelevanceSignal(item.title);
}

function dedupeItems(items) {
  const deduped = [];

  for (const item of items) {
    const normalizedUrl = normalizeUrl(item.originalUrl);
    const normalizedTitle = normalizeTitle(item.originalTitle || item.title);
    const duplicate = deduped.find(
      (candidate) =>
        normalizeUrl(candidate.originalUrl) === normalizedUrl ||
        titleSimilarity(normalizedTitle, normalizeTitle(candidate.originalTitle || candidate.title)) >= 0.82,
    );

    if (!duplicate) {
      deduped.push(item);
    }
  }

  return deduped;
}

function fallbackEnrich(items) {
  const enrichedItems = items.map((item) => {
    const importanceScore = scoreItem(item);
    const importanceLabel = makeImportanceLabel(importanceScore, item.sourceType);
    const title = makeFallbackTitle(item);

    return {
      id: item.id,
      title,
      headlineJa: title,
      originalTitle: item.originalTitle || item.title,
      summaryJa: makeFallbackSummary(item),
      detailJa: makeFallbackDetail(item),
      sourceName: item.sourceName,
      category: item.category,
      categoryLabel: item.categoryLabel,
      sourceType: item.sourceType,
      importanceScore,
      importanceLabel,
      whyItMattersJa: makeFallbackReason(item, importanceScore),
      reliabilityLabel: makeReliabilityLabel(item),
      cautionNote: makeCautionNote(item),
      originalUrl: item.originalUrl,
      publishedAt: item.publishedAt,
      freshnessLabel: item.freshnessLabel,
      collectionNote: item.collectionNote,
      aiScore: importanceScore,
      aiReason: makeFallbackReason(item, importanceScore),
      tags: makeFallbackTags(item),
      selectionMode: "fallback",
    };
  });

  const relevantItems = enrichedItems.filter(hasHardRelevanceSignal);
  const completedItems = ensureCategoryMinimums(relevantItems, relevantItems);

  return {
    overallSummary: makeFallbackOverallSummary(completedItems),
    items: completedItems,
  };
}

async function enrichWithOpenAi(items) {
  if (!items.length) {
    return fallbackEnrich(items);
  }

  const compactItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    originalTitle: item.title,
    sourceName: item.sourceName,
    category: item.category,
    sourceType: item.sourceType,
    freshnessLabel: item.freshnessLabel,
    collectionNote: item.collectionNote,
    excerpt: cleanText(item.excerpt).slice(0, 700),
    originalUrl: item.originalUrl,
    publishedAt: item.publishedAt,
  }));

  const text = await callOpenAi([
    {
      role: "system",
      content:
        "You are an editor for a Japanese UFO/UAP overseas news checker. Return strict JSON only. Do not invent facts. Score by UAP relevance, novelty, primary-source value, public/political impact, verifiability, and rumor risk. Penalize general space news, old roundups, speculation, promotion, thin sightings, and SEO-like posts.",
    },
    {
      role: "user",
      content: `次の海外UFO/UAP関連候補を日本語向けに編集・選定してください。低評価の記事やReddit投稿も、候補に含まれる限りitemsへ入れて日本語見出しを返してください。JSONのみ返してください。形式: {"overallSummary":["...","...","..."],"items":[{"id":"...","headlineJa":"...","summaryJa":"...","detailJa":"...","aiScore":0-10,"aiReason":"...","importanceScore":0-10,"importanceLabel":"重要|通常|要注意","whyItMattersJa":"...","reliabilityLabel":"高|中|低","cautionNote":"...","tags":["..."]}]}。

採点ルール:
- 公式資料、AARO、NASA UAP、war.gov/PURSUE、議会、公聴会、議員発言、法案、FOIA、新規資料公開、一次情報、検証可能な報道は高評価。
- 一般宇宙ニュースでUAP/UFOと無関係なもの、古いまとめ記事、投機性が高い記事、映像・目撃談だけで検証材料が薄いもの、宣伝、雑談、SEO寄りの記事は低評価。
- Reddit/SNS由来、噂、証言のみ、匿名情報、映像投稿、本文確認前の検索ページ由来記事は注意書きを明確にする。
- 元タイトル・抜粋・URLから分からない事実は足さない。
- summaryJaは取得説明ではなく記事内容を120〜180字、2文程度で要約する。冒頭に「XXの記事」「取得しました」と書かない。
- detailJaは取得できているタイトル・抜粋・URL・ソース情報から分かる範囲で、背景・文脈・注意点を250〜400字、3〜5文程度で説明する。取得説明や本文全文を読んだような断定は禁止。
- Reddit/SNS由来のdetailJaには、コミュニティ発・未確認であることを自然に含める。ただし注意書きだけで終わらせない。
- overallSummaryはニュース内容・論点だけを3行で書く。取得件数、補完、未接続、AI判定、fallback、処理状況、Reddit件数などの運用説明は禁止。

候補:
${JSON.stringify(compactItems)}`,
    },
  ]);

  const parsed = JSON.parse(extractJson(text));
  const fallback = fallbackEnrich(items);
  const aiCandidateItems = fallback.items.map((item) => {
    const aiItem = parsed.items?.find((candidate) => candidate.id === item.id);
    return aiItem ? mergeAiItem(item, aiItem) : item;
  });
  const selectedFallbackItems = selectAiItems(fallback.items, parsed.items || []);
  const selectedItems = selectedFallbackItems.map((item) => {
    const aiItem = parsed.items?.find((candidate) => candidate.id === item.id);

    if (!aiItem) {
      return item;
    }

    return mergeAiItem(item, aiItem);
  });
  const relevantSelectedItems = selectedItems.filter(hasHardRelevanceSignal);
  const completedItems = ensureCategoryMinimums(relevantSelectedItems, aiCandidateItems);

  return {
    overallSummary: makeAiOverallSummary(parsed.overallSummary, completedItems, fallback.overallSummary),
    items: completedItems,
  };
}

function mergeAiItem(item, aiItem) {
  const headlineJa = String(aiItem.headlineJa || item.title);
  const aiSummary = String(aiItem.summaryJa || "");
  const aiDetail = String(aiItem.detailJa || "");
  const aiScore = clampScore(aiItem.aiScore ?? aiItem.importanceScore ?? item.importanceScore);
  const importanceLabel =
    item.sourceType === "reddit" || aiItem.importanceLabel === "要注意"
      ? "要注意"
      : aiScore >= aiScoreThreshold
        ? "重要"
        : "通常";

  return {
    ...item,
    title: headlineJa,
    headlineJa,
    originalTitle: item.originalTitle || item.title,
    summaryJa: isBadSummary(aiSummary) ? item.summaryJa : aiSummary || item.summaryJa,
    detailJa: isBadSummary(aiDetail) ? item.detailJa : aiDetail || item.detailJa,
    importanceScore: aiScore,
    aiScore,
    aiReason: String(aiItem.aiReason || item.whyItMattersJa),
    importanceLabel,
    whyItMattersJa: String(aiItem.whyItMattersJa || item.whyItMattersJa),
    reliabilityLabel:
      item.sourceType === "reddit"
        ? "低"
        : ["高", "中", "低"].includes(aiItem.reliabilityLabel)
          ? aiItem.reliabilityLabel
          : item.reliabilityLabel,
    cautionNote: String(aiItem.cautionNote ?? item.cautionNote),
    tags: Array.isArray(aiItem.tags) ? aiItem.tags.map(String).slice(0, 8) : item.tags,
    selectionMode: "ai",
  };
}

function makeAiOverallSummary(aiSummary, items, fallbackSummary) {
  if (!items.length) {
    return fallbackSummary;
  }

  const cleanAiLines = Array.isArray(aiSummary)
    ? aiSummary
        .map(String)
        .filter((line) => !isOperationalSummaryLine(line))
        .slice(0, 3)
    : [];

  return [...cleanAiLines, ...fallbackSummary.filter((line) => !isOperationalSummaryLine(line))].slice(0, 3);
}

function selectAiItems(fallbackItems, aiItems) {
  if (!aiItems.length) {
    return fallbackItems.slice(0, Math.min(12, fallbackItems.length));
  }

  const scored = fallbackItems
    .map((item) => {
      const aiItem = aiItems.find((candidate) => candidate.id === item.id);
      const aiScore = aiItem ? clampScore(aiItem.aiScore ?? aiItem.importanceScore ?? item.importanceScore) : 0;
      return { ...item, aiScore };
    })
    .filter((item) => item.aiScore > 0)
    .sort((left, right) => right.aiScore - left.aiScore);
  const high = scored.filter((item) => item.aiScore >= aiScoreThreshold);
  const fill = scored.filter((item) => item.aiScore >= aiFillThreshold && item.aiScore < aiScoreThreshold);
  const selected = [...high, ...fill].slice(0, maxItems);

  return selected.length ? selected : scored.slice(0, Math.min(12, scored.length));
}

function ensureCategoryMinimums(selectedItems, candidateItems) {
  const completed = applySourceCaps(dedupeItems(selectedItems));

  for (const [category, minimum] of Object.entries(categoryMinimums)) {
    const currentCount = completed.filter((item) => item.category === category).length;

    if (currentCount >= minimum) {
      continue;
    }

    const candidates = candidateItems
      .filter((item) => item.category === category)
      .filter(hasHardRelevanceSignal)
      .filter(isWithinDisplayWindow)
      .filter((item) => !completed.some((selected) => selected.id === item.id))
      .filter((item) => canAddSource(completed, item))
      .sort((left, right) => (right.aiScore ?? right.importanceScore) - (left.aiScore ?? left.importanceScore));

    for (const item of candidates.slice(0, minimum - currentCount)) {
      completed.push(markMinimumFill(item));
    }
  }

  return completed;
}

function markMinimumFill(item) {
  if (item.category !== "buzz") {
    return item;
  }

  const title = item.headlineJa || makeRedditFallbackHeadline(item);

  return {
    ...item,
    title,
    headlineJa: title,
    importanceLabel: "要注意",
    reliabilityLabel: "低",
    cautionNote: item.cautionNote || "Reddit由来のコミュニティ発情報です。公式確認や追加資料は別途確認してください。",
  };
}

function sortItemsForDisplay(items) {
  return [...items].sort((left, right) => {
    const scoreDiff = (right.aiScore ?? right.importanceScore) - (left.aiScore ?? left.importanceScore);

    if (scoreDiff) {
      return scoreDiff;
    }

    return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
  });
}

function hasHardRelevanceSignal(item) {
  if (item.category !== "news") {
    return true;
  }

  const haystack = `${item.title} ${item.originalTitle || ""} ${item.summaryJa || ""} ${item.aiReason || ""}`.toLowerCase();
  return hasUapRelevanceSignal(haystack);
}

function hasUapRelevanceSignal(value) {
  return /\b(?:uap|uaps|ufo|ufos|aaro|pursue|foia|aatip|grusch)\b|unidentified(?:.{0,40})anomalous|anomalous(?:.{0,40})phenomena|disclosure|whistleblower|pentagon(?:.{0,80})ufo|ufo(?:.{0,80})pentagon|congress(?:.{0,80})(?:uap|ufo)|(?:uap|ufo)(?:.{0,80})congress|hearing(?:.{0,80})(?:uap|ufo)|(?:uap|ufo)(?:.{0,80})hearing/i.test(
    value,
  );
}

function trimToMaxWithMinimums(items) {
  const sorted = sortItemsForDisplay(applySourceCaps(dedupeItems(items)));

  if (sorted.length <= maxItems) {
    return sorted;
  }

  const protectedItems = [];

  for (const [category, minimum] of Object.entries(categoryMinimums)) {
    protectedItems.push(...sorted.filter((item) => item.category === category).slice(0, minimum));
  }

  const remaining = sorted.filter((item) => !protectedItems.some((protectedItem) => protectedItem.id === item.id));
  return sortItemsForDisplay([...protectedItems, ...remaining.slice(0, maxItems - protectedItems.length)]);
}

function applySourceCaps(items) {
  const counts = new Map();

  return items.filter((item) => {
    const cap = categorySourceCaps[item.category];

    if (!cap) {
      return true;
    }

    const key = `${item.category}:${item.sourceName}`;
    const count = counts.get(key) || 0;

    if (count >= cap) {
      return false;
    }

    counts.set(key, count + 1);
    return true;
  });
}

function canAddSource(items, item) {
  const cap = categorySourceCaps[item.category];

  if (!cap) {
    return true;
  }

  return items.filter((selected) => selected.category === item.category && selected.sourceName === item.sourceName).length < cap;
}

async function callOpenAi(input) {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), openAiTimeoutMs);

    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${openAiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: openAiModel,
          input,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`OpenAI request failed: ${response.status} ${body}`);
      }

      const data = await response.json();
      const text =
        data.output_text ||
        data.output
          ?.flatMap((item) => item.content || [])
          .map((content) => content.text || "")
          .join("")
          .trim();

      if (!text) {
        throw new Error("OpenAI request returned empty text.");
      }

      return text;
    } catch (error) {
      lastError =
        error?.name === "AbortError" ? new Error(`OpenAI request timed out after ${openAiTimeoutMs / 1000}s`) : error;

      if (attempt < 3) {
        await wait(1000 * attempt);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError;
}

function wait(ms) {
  return new Promise((resolveWait) => {
    setTimeout(resolveWait, ms);
  });
}

function scoreItem(item) {
  let score = item.sourceType === "official" ? 7 : item.sourceType === "news" ? 5 : 3;
  const haystack = `${item.title} ${item.excerpt}`.toLowerCase();

  if (/congress|hearing|aaro|foia|pentagon|whistleblower|disclosure|pursue|odni|nara|records/.test(haystack)) {
    score += 2;
  }

  if (/video|sighting|orb|drone|reddit|posted/.test(haystack) || item.sourceType === "reddit") {
    score -= 1;
  }

  if (item.scoreHint > 300) {
    score += 1;
  }

  return Math.max(1, Math.min(10, score));
}

function getLookbackDays(item) {
  return Number(item.lookbackDays || defaultLookbackDays[item.category] || 30);
}

function makeImportanceLabel(score, sourceType) {
  if (sourceType === "reddit" && score <= 4) {
    return "要注意";
  }

  if (score >= 7) {
    return "重要";
  }

  return "通常";
}

function makeFallbackSummary(item) {
  const topic = makeSummaryTopic(item);
  const summary =
    item.sourceType === "reddit"
      ? makeRedditFallbackSummary(topic)
      : item.sourceType === "official"
        ? makeOfficialFallbackSummary(topic)
        : makeNewsFallbackSummaryFromTopic(topic);

  return compactSentences(expandFallbackSummary(summary, item, topic));
}

function makeFallbackDetail(item) {
  const topic = makeSummaryTopic(item);
  const summary = makeFallbackSummary(item);
  const detail = makeFallbackDetailFromTopic(topic, item);

  return compactSentences(`${summary}${detail ? ` ${detail}` : ""}`);
}

function makeFallbackTitle(item) {
  if (item.sourceType === "reddit") {
    return makeRedditFallbackHeadline(item);
  }

  if (item.sourceType === "official") {
    return makeOfficialFallbackHeadline(item);
  }

  return makeNewsFallbackHeadline(item);
}

function makeOfficialFallbackHeadline(item) {
  const haystack = `${item.title} ${item.excerpt} ${item.sourceName}`.toLowerCase();

  if (/nara|national archives|records collection|guidance/.test(haystack)) {
    return "National ArchivesがUAP記録コレクション関連資料を更新";
  }

  if (/opens hearing|luna opens/.test(haystack)) {
    return "ルナ議員がUAP透明性公聴会の開会発言を公開";
  }

  if (/wrap up|government must be more transparent/.test(haystack)) {
    return "下院監視委がUAP公聴会の要点を公表";
  }

  if (/restoring public trust|whistleblower protection/.test(haystack)) {
    return "米議会でUAP透明性と内部告発者保護を扱う公聴会予定";
  }

  if (/house|senate|congress|hearing|oversight|luna|burchett/.test(haystack)) {
    return `米議会のUAP透明性をめぐる公式更新：${makeTitleDetail(item)}`;
  }

  if (/aaro/.test(haystack)) {
    return `AAROがUAP関連の公式資料を更新：${makeTitleDetail(item)}`;
  }

  if (/defense|war\.gov|pursue|pentagon/.test(haystack)) {
    return `米国防総省系のUAP資料更新：${makeTitleDetail(item)}`;
  }

  if (/nasa/.test(haystack)) {
    return "NASAのUAP関連情報を確認";
  }

  return `${item.sourceName}がUAP関連資料を更新`;
}

function makeNewsFallbackHeadline(item) {
  const haystack = `${item.title} ${item.excerpt} ${item.sourceName}`.toLowerCase();
  const detail = makeTitleDetail(item);

  if (/17-year|17 year|withholding|total withholding/.test(haystack)) {
    return `${item.sourceName}が17年越しのFOIA請求結果を報道`;
  }

  if (/space tiger team/.test(haystack)) {
    return `${item.sourceName}がUAP「Space Tiger Team」文書を報道`;
  }

  if (/kosloski|annual report|media roundtable/.test(haystack)) {
    return `${item.sourceName}がAARO年次報告の記者説明記録を紹介`;
  }

  if (/public hearing|in full/.test(haystack)) {
    return `${item.sourceName}がUAP公聴会の全編資料を紹介`;
  }

  if (/pursue|pentagon(?:.{0,80})videos?|file release|document dump|ufo files/.test(haystack)) {
    return `${item.sourceName}がPURSUE・国防総省UAP資料公開を報道`;
  }

  if (/foia|black vault|documents?|records?/.test(haystack)) {
    return `${item.sourceName}がFOIA・UAP資料関連の記事を公開：${detail}`;
  }

  if (/congress|hearing|burchett|luna|gillibrand|whistleblower|grusch/.test(haystack)) {
    return `${item.sourceName}がUAPをめぐる議会・証言関連の動きを報道：${detail}`;
  }

  if (/pursue|pentagon|defense|war\.gov|aaro/.test(haystack)) {
    return `${item.sourceName}が米政府のUAP情報公開をめぐる論点を報道：${detail}`;
  }

  if (/disclosure|transparency|registration act/.test(haystack)) {
    return `${item.sourceName}がUAP情報公開をめぐる論点を報道：${detail}`;
  }

  if (/video|footage|sighting|drone/.test(haystack)) {
    return `${item.sourceName}がUFO・UAP関連映像の話題を報道：${detail}`;
  }

  return `${item.sourceName}がUFO・UAP関連の動向を報道：${detail}`;
}

function makeRedditFallbackHeadline(item) {
  const haystack = item.title.toLowerCase();

  if (/associated press|press conference/.test(haystack)) {
    return "Redditで話題：AP記者会見とUAPファイル公開要求";
  }

  if (/archive|files?|documents?|war\.gov|pursue/.test(haystack)) {
    return "Redditで話題：war.gov公式UFO・UAP資料アーカイブの共有";
  }

  if (/congress|whistleblower|grusch|hearing/.test(haystack)) {
    return "Redditで話題：議会・内部告発者・記者会見をめぐる投稿";
  }

  if (/washington post/.test(haystack)) {
    return "Redditで話題：Washington Post記者のUAP議論への関心";
  }

  if (/washington post|journalist|investigative|reporter/.test(haystack)) {
    return "Redditで話題：報道機関や調査報道への期待をめぐる投稿";
  }

  if (/alien|aliens\.gov|administration|government/.test(haystack)) {
    return "Redditで話題：政府対応への批判や不信感をめぐる投稿";
  }

  if (/disclosure/.test(haystack)) {
    return "Redditで話題：ディスクロージャーをめぐる投稿";
  }

  if (/video|footage|sighting|orb|drone/.test(haystack)) {
    return "Redditで話題：映像・目撃情報をめぐる投稿";
  }

  return "Redditで話題：UFO・UAPコミュニティの注目投稿";
}

function makeTitleDetail(item) {
  const haystack = `${item.originalTitle || item.title} ${item.title} ${item.excerpt || ""}`.toLowerCase();
  const topic = makeSummaryTopic(item);

  if (topic === "uap-registration") {
    return "UAP登録法案論";
  }

  if (topic === "doty-disinformation") {
    return "Doty氏と偽情報問題";
  }

  if (topic === "information-gaps") {
    return "国家安全保障上の情報ギャップ";
  }

  if (topic === "mike-gold") {
    return "Mike Gold氏と宇宙政策";
  }

  if (topic === "disclosure-investment") {
    return "ディスクロージャー投資テーマ";
  }

  if (topic === "ocean-energy") {
    return "海洋・エネルギー論点";
  }

  if (topic === "pursue-politics") {
    return "PURSUE公開の政治的文脈";
  }

  if (topic === "pursue-first-release") {
    return "PURSUE初回公開";
  }

  if (topic === "uap-video-release") {
    return "新たなUAP映像公開見通し";
  }

  if (topic === "burchett-pentagon-files") {
    return "Burchett議員発言";
  }

  if (topic === "media-reaction") {
    return "主要メディア反応まとめ";
  }

  if (topic === "hearing-schedule") {
    return "透明性公聴会";
  }

  if (topic === "hearing-wrap") {
    return "公聴会まとめ";
  }

  if (topic === "hearing-opening") {
    return "公聴会開会発言";
  }

  if (topic === "nara-guidance") {
    return "記録管理ガイダンス";
  }

  if (topic === "counter-uas") {
    return "対UAS能力";
  }

  if (/registration act/.test(haystack)) {
    return "UAP登録法案論";
  }

  if (/richard doty|bennewitz|disinformation/.test(haystack)) {
    return "Doty氏と偽情報問題";
  }

  if (/information gaps|national security|new administration/.test(haystack)) {
    return "国家安全保障上の情報ギャップ";
  }

  if (/mike gold|uapist|space policy/.test(haystack)) {
    return "Mike Gold氏と宇宙政策";
  }

  if (/investor|markets|etf/.test(haystack)) {
    return "ディスクロージャー投資テーマ";
  }

  if (/vacuum|oceans|brewing/.test(haystack)) {
    return "海洋・エネルギー論点";
  }

  if (/trump|presidential unsealing/.test(haystack)) {
    return "PURSUE公開の政治的文脈";
  }

  if (/launches|first .*release|file release/.test(haystack)) {
    return "PURSUE初回公開";
  }

  if (/new batch|videos?|soon be released/.test(haystack)) {
    return "新たなUAP映像公開見通し";
  }

  if (/burchett|woke congress|sleeping congress/.test(haystack)) {
    return "Burchett議員発言";
  }

  if (/47 headlines|msm|reacting/.test(haystack)) {
    return "主要メディア反応まとめ";
  }

  if (/public hearing|restoring public trust/.test(haystack)) {
    return "透明性公聴会";
  }

  if (/wrap up/.test(haystack)) {
    return "公聴会まとめ";
  }

  if (/opens hearing/.test(haystack)) {
    return "公聴会開会発言";
  }

  if (/guidance|records collection/.test(haystack)) {
    return "記録管理ガイダンス";
  }

  if (/counter-uas|uas capability/.test(haystack)) {
    return "対UAS能力";
  }

  return "関連論点";
}

function makeSummaryTopic(item) {
  const haystack = `${item.originalTitle || ""} ${item.title || ""} ${item.excerpt || ""} ${item.sourceName || ""}`.toLowerCase();

  if (item.sourceType === "reddit") {
    if (/associated press|press conference/.test(haystack)) return "reddit-ap-press";
    if (/washington post/.test(haystack)) return "reddit-wapo";
    if (/journalist|investigative|reporter/.test(haystack)) return "reddit-journalists";
    if (/archive|files?|documents?|war\.gov|pursue/.test(haystack)) return "reddit-war-archive";
    if (/alien|aliens\.gov|administration|government/.test(haystack)) return "reddit-government-criticism";
    if (/congress|whistleblower|grusch|hearing/.test(haystack)) return "reddit-congress";
  }

  if (/17-year|17 year|withholding|total withholding/.test(haystack)) return "foia-withholding";
  if (/registration act/.test(haystack)) return "uap-registration";
  if (/richard doty|bennewitz|disinformation/.test(haystack)) return "doty-disinformation";
  if (/information gaps|national security|new administration/.test(haystack)) return "information-gaps";
  if (/mike gold|uapist|space policy/.test(haystack)) return "mike-gold";
  if (/public hearing|in full|april 19, 2023/.test(haystack)) return "public-hearing-full";
  if (/kosloski|annual report|media roundtable/.test(haystack)) return "aaro-roundtable";
  if (/burchett|woke congress|sleeping congress/.test(haystack)) return "burchett-pentagon-files";
  if (/47 headlines|msm|reacting/.test(haystack)) return "media-reaction";
  if (/investor|markets|etf/.test(haystack)) return "disclosure-investment";
  if (/vacuum|oceans|brewing/.test(haystack)) return "ocean-energy";
  if (/pentagon poised|new batch|videos?|soon be released/.test(haystack)) return "uap-video-release";
  if (/launches|first .*release|file release/.test(haystack)) return "pursue-first-release";
  if (/trump|presidential unsealing/.test(haystack)) return "pursue-politics";
  if (/space tiger team/.test(haystack)) return "space-tiger-team";
  if (/hearing wrap|wrap up|government must be more transparent/.test(haystack)) return "hearing-wrap";
  if (/opens hearing|luna opens/.test(haystack)) return "hearing-opening";
  if (/restoring public trust|whistleblower protection/.test(haystack)) return "hearing-schedule";
  if (/guidance|records collection|national archives|nara/.test(haystack)) return "nara-guidance";
  if (/counter-uas|uas capability/.test(haystack)) return "counter-uas";
  if (/foia|documents?|records?/.test(haystack)) return "foia-documents";
  if (/disclosure|transparency/.test(haystack)) return "disclosure-transparency";
  if (/pursue|pentagon|defense|war\.gov|aaro/.test(haystack)) return "government-disclosure";
  if (/video|footage|sighting|orb|drone/.test(haystack)) return "sighting-video";

  return "general-uap";
}

function makeOfficialFallbackSummary(topic) {
  const summaries = {
    "nara-guidance": "米国立公文書館が、UAP記録コレクションに関する連邦機関向けガイダンスを示しています。今後の記録移管や公開範囲を追ううえで基礎になる一次情報です。",
    "hearing-schedule": "UAP透明性と内部告発者保護を扱う米下院公聴会の予定・資料です。議会側が情報公開と証言保護をどのように扱うかを見る入口になります。",
    "hearing-opening": "ルナ議員によるUAP透明性公聴会の開会発言です。関係機関の調査や活動に対する議会側の問題意識が示されています。",
    "hearing-wrap": "米下院側がUAP公聴会の要点をまとめた資料です。政府にさらなる透明性を求める議会側の姿勢を確認できます。",
    "counter-uas": "対UAS能力の調達に関する国防総省系の発表です。UAPそのものではなく、空中の未確認・無人システム対策という周辺文脈として扱います。",
    "government-disclosure": "米政府系のUAP関連資料や情報公開の動きを扱う一次情報です。報道やコミュニティ議論の前提になる確認材料です。",
  };

  return summaries[topic] || "UAP関連の一次情報や公式資料の動きです。後続の報道や資料検証の前提として確認する価値があります。";
}

function makeNewsFallbackSummaryFromTopic(topic) {
  const summaries = {
    "uap-registration": "UAP関連産業や情報公開を、登録制度という枠組みで整理する提案を扱っています。ディスクロージャーを制度設計から進める議論です。",
    "doty-disinformation": "偽情報工作やPaul Bennewitz事件の文脈から、UAP内部告発や信頼性問題を振り返る記事です。過去の情報操作が現在の議論に与える影響を扱っています。",
    "information-gaps": "国家安全保障上のUAP情報ギャップをどう埋めるかを論じています。議会や新政権に向けた制度的な改善案が中心です。",
    "mike-gold": "Mike Gold氏の発言を通じて、UAPIST、議会公聴会、宇宙政策の接点を扱っています。UAP問題を宇宙政策側から見る記事です。",
    "public-hearing-full": "過去のUAP公聴会を全編で確認できる資料です。議会証言や当時の公式説明を振り返るための参照点になります。",
    "aaro-roundtable": "AARO年次報告をめぐるJon Kosloski氏の記者説明記録です。公式報告の読み方や未解決事例への姿勢を確認できます。",
    "burchett-pentagon-files": "Tim Burchett議員が、国防総省のUFOファイル公開が議会の関心を高めたと語る内容です。議会側の反応を示す記事です。",
    "media-reaction": "国防総省のUFO文書公開に対する主要メディアの反応を整理しています。公開資料が一般報道でどう扱われたかを見る材料です。",
    "disclosure-investment": "UFOディスクロージャーが市場や投資テーマになり得るという視点を扱っています。情報公開を金融・産業面から読む記事です。",
    "ocean-energy": "海洋での異変、真空エネルギー、国防総省UFOファイルなど複数の話題をまとめています。UAP周辺領域の広がりを示す記事です。",
    "uap-video-release": "PURSUEを通じた新たなUAP映像公開の見通しを扱っています。公開予定の資料や映像に何が含まれるかが焦点です。",
    "pursue-first-release": "PURSUE初回公開として、国防総省系のUAP文書や関連資料の公開を扱っています。政府主導の情報公開の始まりとして重要です。",
    "pursue-politics": "PURSUEをめぐるUFOファイル公開を、政権や大統領主導の情報公開という文脈で扱っています。政治的な見せ方も論点です。",
    "foia-withholding": "17年に及ぶFOIA請求が全面不開示で終わった事例を扱っています。情報公開制度の限界や不透明さが焦点です。",
    "space-tiger-team": "UAPの宇宙・トランスメディア事例を扱う「Space Tiger Team」関連文書について報じています。新公開資料の中身が焦点です。",
    "foia-documents": "FOIAや公開文書を手がかりに、UAP関連資料の内容や公開状況を検証する記事です。",
    "disclosure-transparency": "UAP情報公開や透明性をめぐる制度・政治的な論点を扱っています。公開の進め方が焦点です。",
    "government-disclosure": "AARO、国防総省、PURSUEなど米政府側のUAP情報公開をめぐる動きを扱っています。",
    "sighting-video": "UFO・UAP関連の映像や目撃情報を扱う記事です。検証材料の有無を意識して読む必要があります。",
  };

  return summaries[topic] || "UFO・UAP情報公開をめぐる周辺論点を扱っています。公式資料、報道、議会動向をあわせて読むための材料です。";
}

function makeRedditFallbackSummary(topic) {
  const summaries = {
    "reddit-war-archive": "war.govの公式UFO・UAP資料を見やすく整理するアーカイブ共有が話題になっています。コミュニティ発の整理ですが、公式資料への導線として注目されています。",
    "reddit-ap-press": "APの記者会見や議員・内部告発者によるUFOファイル公開要求が話題になっています。行動を求める投稿として広がっています。",
    "reddit-wapo": "Washington Post記者がUAP/UFO議論への関心を示した投稿が注目されています。主要メディアの関与への期待が背景にあります。",
    "reddit-journalists": "調査報道や記者の役割に期待する投稿が話題になっています。公式発表だけでなく、外部検証を求める空気が見えます。",
    "reddit-government-criticism": "政府サイトや内部告発者への扱いをめぐる批判的な投稿です。公式確認とは別に、コミュニティの不信感を示しています。",
    "reddit-congress": "議会、内部告発者、公聴会をめぐる投稿が話題です。公式な追加確認が必要なコミュニティ発の論点です。",
  };

  return summaries[topic] || "UAPコミュニティ内で注目されている投稿です。公式情報ではないため、元リンクや一次資料とあわせて読む必要があります。";
}

function expandFallbackSummary(summary, item, topic) {
  if (summary.length >= 120) {
    return summary;
  }

  const additions = {
    official:
      "公式資料としての位置づけを確認し、後続の報道や議会論点とつながるかを見ると全体像を把握しやすくなります。",
    news:
      "一次資料や議会動向との接点を確認することで、単発記事ではなく今日の情報公開の流れとして読めます。",
    reddit:
      "コミュニティ発の未確認情報として扱い、公式資料や信頼できる報道で裏取りできる部分だけを切り分けて読む必要があります。",
  };

  if (topic === "sighting-video") {
    return `${summary} 映像系の話題は拡散しやすいため、撮影条件、元投稿、反証コメント、公式確認の有無を分けて読む必要があります。`;
  }

  return `${summary} ${additions[item.sourceType] || additions.news}`;
}

function makeFallbackDetailFromTopic(topic, item) {
  const details = {
    "uap-registration":
      "登録制度という切り口は、UAP関連の産業・研究・情報公開をどこまで公的な枠組みに入れるかという議論につながります。法案や制度案はすぐに実現するとは限りませんが、議会や政策側がUAP問題をどう扱おうとしているかを見る材料になります。",
    "doty-disinformation":
      "Richard Doty氏やPaul Bennewitz事件に触れる話題は、UAP情報の信頼性を考えるうえで避けにくい文脈です。過去の偽情報工作や心理的影響の問題は、現在の内部告発、証言、匿名情報を評価する際の注意点にもつながります。",
    "information-gaps":
      "国家安全保障上の情報ギャップという論点は、単なる目撃談ではなく、政府内の報告経路、分析体制、議会監督の問題としてUAPを扱う視点です。新政権や議会がどこまで制度改善に踏み込むかを見る材料になります。",
    "public-hearing-full":
      "公聴会の全編資料は、短い引用やSNS上の切り抜きでは分からない発言の前後関係を確認するために役立ちます。証言者が何を断定し、何を限定的に述べているのかを分けて読むことが重要です。",
    "aaro-roundtable":
      "AARO年次報告や記者説明は、未解決事例の扱い、調査範囲、政府側の説明姿勢を読む一次寄りの材料です。報告書本文とあわせて見ることで、報道見出しだけでは抜けやすい制約や留保も確認できます。",
    "foia-withholding":
      "全面不開示や長期化したFOIA請求は、情報公開制度が機能している部分と限界の両方を示します。公開されない理由、対象文書、機関側の説明を確認すると、単なる秘匿ではなく制度上の争点として読めます。",
    "space-tiger-team":
      "Space Tiger Team関連文書は、UAPを空中現象だけでなく宇宙・海中・複数領域の問題として扱う議論に関わります。文書名や抜粋だけでは中身を断定できないため、公開資料本文との照合が必要です。",
    "pursue-first-release":
      "PURSUEは政府系UAP資料公開の導線として注目されます。初回公開は資料の範囲、更新頻度、映像や文書の扱い方を見る基準になり、今後の追加公開を評価するための起点になります。",
    "uap-video-release":
      "映像公開の見通しは注目されやすい一方、映像だけでは由来や分析結果が不足しがちです。公開時には撮影条件、センサー情報、政府側の説明、独立検証の有無をあわせて確認する必要があります。",
    "hearing-schedule":
      "公聴会予定は、議会がどの証人や論点を選ぶかによって重みが変わります。内部告発者保護、情報公開、国防総省や情報機関への監督がどこまで議題化されるかが焦点になります。",
    "hearing-opening":
      "開会発言は公聴会全体の問題設定を示します。個別の証言より前に、議会側が透明性、機密指定、内部告発者保護をどの優先順位で扱うかを確認できます。",
    "hearing-wrap":
      "公聴会後のまとめは、議会側がどの発言や争点を公式に残したいかを示します。証言内容そのものに加えて、今後の追加資料要求や法案議論につながるかが読みどころです。",
    "nara-guidance":
      "NARAのUAP記録コレクションは、2024年NDAA以後の記録整理や移管の基盤になります。すぐに新事実が出る話ではなくても、各機関がどの文書をどう扱うかを見るうえで重要な公式導線です。",
    "counter-uas":
      "対UASの話題はUAPそのものとは異なりますが、未確認の空中対象を検知・追跡・識別する技術や運用と重なる部分があります。UAP報道と混同せず、防衛・空域監視の周辺文脈として読むのが適切です。",
    "reddit-war-archive":
      "資料アーカイブの共有は便利ですが、整理の仕方やリンク選定は投稿者に依存します。公式サイト上の原文、公開日、資料名を確認し、コメント欄の解釈と一次資料を分けて読む必要があります。",
    "reddit-ap-press":
      "記者会見や公開要求に関する投稿は、行動喚起として広がりやすい性質があります。実際にどの議員や団体が関与しているのか、公式な告知や報道があるのかを確認すると、話題の強さと事実関係を分けられます。",
    "reddit-wapo":
      "主要メディア記者への期待は、UAP問題を一般報道がどこまで扱うかという関心を反映しています。ただし投稿時点では取材着手や記事化を意味しないため、実際の報道公開までは未確認の話題として扱います。",
    "reddit-journalists":
      "調査報道への期待は、公式発表だけでは不十分だと感じるコミュニティの空気を示します。記者名、媒体、過去記事、公開予定の有無を確認し、憶測と実際の取材成果を切り分けて読む必要があります。",
    "reddit-government-criticism":
      "政府対応への批判は、透明性への不満や内部告発者保護への関心を示します。ただし感情的な反応も混ざりやすいため、公式資料、議会発言、信頼できる報道で確認できる要素だけを拾うのが安全です。",
    "reddit-congress":
      "議会や内部告発者に関する投稿は、コミュニティ内では関心が高い一方、未確認の引用や断片情報が混ざりやすい領域です。公聴会資料、議員発表、公式動画など一次情報にたどれるかを確認してください。",
  };

  if (details[topic]) {
    return details[topic];
  }

  if (item.sourceType === "reddit") {
    return "ネット上の話題は、今日のコミュニティの関心や疑問を知るには役立ちます。ただし公式確認前の投稿や解釈が含まれるため、元投稿、リンク先、コメント欄の反証、一次資料の有無を分けて読む必要があります。";
  }

  if (item.sourceType === "official") {
    return "公式ソースの更新は頻度が高くない一方、後続の報道や議会議論の基礎になります。新発表か、既存資料の整理か、公開対象が文書・映像・公聴会資料のどれなのかを確認すると読みやすくなります。";
  }

  return "この話題は、UAP情報公開、議会監督、公式資料、専門メディア報道の流れの中で読むと位置づけが分かりやすくなります。見出しだけで断定せず、元記事が参照している一次資料や発言者、公開日を確認することが重要です。";
}

function compactSentences(text) {
  return String(text).replace(/\s+/g, " ").replace(/([。！？])\s+/g, "$1").trim();
}

function ensureUniqueHeadlines(items) {
  const seen = new Map();

  return items.map((item) => {
    const headline = item.headlineJa || item.title;
    const count = seen.get(headline) || 0;

    if (!count) {
      seen.set(headline, 1);
      return item;
    }

    const detail = makeTitleDetail(item);
    let uniqueHeadline = `${headline}：${detail}`;
    let suffix = 2;

    while (seen.has(uniqueHeadline)) {
      suffix += 1;
      uniqueHeadline = `${headline}：${detail} ${suffix}`;
    }

    seen.set(headline, count + 1);
    seen.set(uniqueHeadline, 1);

    return {
      ...item,
      title: uniqueHeadline,
      headlineJa: uniqueHeadline,
    };
  });
}

function makeFallbackReason(item, score) {
  if (item.sourceType === "official") {
    return "一次情報源の更新や導線は、後続の報道や資料確認の起点になります。";
  }

  if (item.sourceType === "reddit") {
    return "コミュニティ内の注目度を把握できますが、公式確認や追加資料が必要です。";
  }

  return score >= 7
    ? "議会・公式機関・情報公開に関わる可能性があり、今日の動向確認で優先度が高めです。"
    : "海外UFO・UAP界隈の話題の流れを把握する材料になります。";
}

function makeReliabilityLabel(item) {
  if (item.sourceType === "official") {
    return "高";
  }

  if (item.sourceType === "reddit") {
    return "低";
  }

  return "中";
}

function makeCautionNote(item) {
  if (item.sourceType === "reddit") {
    return "SNS/コミュニティ発の未確認情報です。公式確認や追加資料は別途確認してください。";
  }

  if (item.sourceType === "official") {
    return "";
  }

  return "本文確認前の自動取得データです。重要な判断は元記事で確認してください。";
}

function makeFallbackTags(item) {
  const haystack = `${item.title} ${item.excerpt} ${item.sourceName}`.toLowerCase();
  const tags = [];

  if (item.sourceType === "official") {
    tags.push("公式");
  }

  if (/congress|hearing|burchett|gillibrand|luna/.test(haystack)) {
    tags.push("議会");
  }

  if (/aaro/.test(haystack)) {
    tags.push("AARO");
  }

  if (/pursue/.test(haystack)) {
    tags.push("PURSUE");
  }

  if (/foia/.test(haystack)) {
    tags.push("FOIA");
  }

  if (/video|sighting|orb|drone/.test(haystack)) {
    tags.push("映像・目撃");
  }

  if (item.sourceType === "reddit") {
    tags.push("Reddit", "未確認");
  }

  return tags.slice(0, 8);
}

function makeFallbackOverallSummary(items) {
  if (!items.length) {
    return [
      "公式機関から大きな新発表は見当たらず、一次情報の確認が中心です。",
      "専門メディアでは、議会・FOIA・情報公開をめぐる論点が続いています。",
      "ネット上の話題は限定的で、元情報の確認を前提に追う流れです。",
    ];
  }

  const sortedItems = sortItemsForDisplay(items);
  const officialLine = makeOfficialSummaryLine(sortedItems);
  const newsLine = makeNewsSummaryLine(sortedItems);
  const buzzLine = makeBuzzSummaryLine(sortedItems);
  const fallbackLines = [
    "今日は大きな新発表より、既存資料・議会・情報公開を追う流れが中心です。",
    "専門メディアでは、UAP透明性や政府資料の読み解きが主な論点です。",
    "ネット上では、公式資料や報道への反応が静かに話題になっています。",
  ];

  return [officialLine, newsLine, buzzLine, ...fallbackLines].filter(Boolean).slice(0, 3);
}

function makeOfficialSummaryLine(items) {
  const officialItems = items.filter((item) => item.category === "official");
  const haystack = officialItems.map(itemText).join(" ").toLowerCase();

  if (!officialItems.length) {
    return "公式機関から大きな新発表は見当たらず、既存資料の確認が中心です。";
  }

  if (/house|senate|congress|hearing|oversight|luna|burchett|議会/.test(haystack)) {
    return "米議会のUAP透明性や公聴会関連資料が、公式側の中心論点です。";
  }

  if (/nara|national archives|records collection|guidance/.test(haystack)) {
    return "National ArchivesのUAP記録コレクション関連資料が一次情報の軸です。";
  }

  if (/aaro|pursue|defense|war\.gov|pentagon/.test(haystack)) {
    return "AAROや国防総省系の資料公開をめぐる確認が続いています。";
  }

  return "公式ソースでは、UAP関連資料や一次情報の更新確認が中心です。";
}

function makeNewsSummaryLine(items) {
  const newsItems = items.filter((item) => item.category === "news");
  const haystack = newsItems.map(itemText).join(" ").toLowerCase();

  if (!newsItems.length) {
    return "専門メディアでは、目立った新規論点より既存テーマの確認が中心です。";
  }

  if (/foia|black vault|document|record|資料/.test(haystack)) {
    return "専門メディアでは、FOIAや公開資料を手がかりにした検証記事が目立ちます。";
  }

  if (/pursue|pentagon|defense|war\.gov|aaro/.test(haystack)) {
    return "専門メディアでは、米政府のUAP情報公開とPURSUE関連の論点が続いています。";
  }

  if (/congress|hearing|whistleblower|grusch|議会|証言/.test(haystack)) {
    return "報道では、議会・証言・透明性をめぐる政治的な圧力が焦点です。";
  }

  if (/disclosure|transparency/.test(haystack)) {
    return "報道では、UAP情報公開と透明性をどう進めるかが主な論点です。";
  }

  return "専門メディアでは、UAP情報公開をめぐる制度・資料面の論点が続いています。";
}

function makeBuzzSummaryLine(items) {
  const buzzItems = items.filter((item) => item.category === "buzz");
  const haystack = buzzItems.map(itemText).join(" ").toLowerCase();

  if (!buzzItems.length) {
    return "ネット上の話題は限定的で、報道や公式資料への反応が中心です。";
  }

  if (/archive|documents?|files?|war\.gov|pursue|資料|アーカイブ/.test(haystack)) {
    return "ネット上では、war.govや公式UAP資料アーカイブへの関心が集まっています。";
  }

  if (/associated press|press conference|congress|whistleblower|grusch|hearing|議会/.test(haystack)) {
    return "ネット上では、議会・内部告発者・記者会見をめぐる投稿が話題です。";
  }

  if (/journalist|investigative|washington post|reporter|報道/.test(haystack)) {
    return "ネット上では、調査報道や主要メディアの関与への期待が話題です。";
  }

  return "ネット上では、公式資料や報道への反応がUAPコミュニティで話題です。";
}

function itemText(item) {
  return `${item.title || ""} ${item.originalTitle || ""} ${item.summaryJa || ""} ${item.sourceName || ""}`;
}

function isOperationalSummaryLine(line) {
  return /取得|補完|未接続|AIが|fallback|処理|生成|更新でき|件|ソース|カテゴリ/.test(String(line));
}

function isBadSummary(line) {
  return /取得|取得しました|記事として|公式資料・リリースとして取得|原題と取得情報|参考情報です/.test(String(line));
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function hoursSince(value) {
  const date = new Date(value);
  const time = Number.isNaN(date.getTime()) ? now.getTime() : date.getTime();
  return (now.getTime() - time) / 1000 / 60 / 60;
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((key) =>
      url.searchParams.delete(key),
    );
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return value;
  }
}

function normalizeTitle(value) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleSimilarity(left, right) {
  const leftWords = new Set(left.split(" ").filter(Boolean));
  const rightWords = new Set(right.split(" ").filter(Boolean));
  const union = new Set([...leftWords, ...rightWords]);
  const intersection = [...leftWords].filter((word) => rightWords.has(word));
  return union.size ? intersection.length / union.size : 0;
}

function stableId(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return `keyhoe-${Math.abs(hash).toString(36)}`;
}

function extractHtmlTitle(html) {
  return decodeHtml(stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim());
}

function extractMetaDescription(html) {
  const match =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i);

  return decodeHtml(match?.[1] || "");
}

function stripTags(value) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ");
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function cleanText(value) {
  return decodeHtml(stripTags(value || ""))
    .replace(/\s+/g, " ")
    .trim();
}

function cleanLinkTitle(value) {
  return cleanText(value)
    .replace(/\s+\.{3}omitted\s+/i, " ")
    .replace(/\s{2,}/g, " ")
    .slice(0, 180)
    .trim();
}

function extractJson(value) {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");

  if (start < 0 || end < 0) {
    throw new Error("OpenAI response did not include JSON.");
  }

  return value.slice(start, end + 1);
}

function clampScore(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(10, Math.round(number))) : 5;
}

await main();
