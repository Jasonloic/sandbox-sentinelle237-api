import Parser from "rss-parser";
import { HttpException } from "../utils/HttpExceptions";

const parser = new Parser({ timeout: 15000 });

export type ParsedFeed = {
  title?: string;
  link?: string;
  image?: { url?: string };
  items: {
    title?: string;
    link?: string;
    contentSnippet?: string;
    content?: string;
    isoDate?: string;
    pubDate?: string;
    creator?: string;
    enclosure?: { url?: string };
  }[];
};

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
};

async function fetchWithTimeout(url: string, timeoutMs = 12000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export class FeedParserService {
  async parseFeed(feedUrl: string): Promise<ParsedFeed> {
    try {
      return (await parser.parseURL(feedUrl)) as ParsedFeed;
    } catch (err) {
      throw new HttpException(422, this.explainFailure(err));
    }
  }

  async discoverFeedUrl(pageUrl: string): Promise<string> {
    try {
      await parser.parseURL(pageUrl);
      return pageUrl;
    } catch {
      // pas un flux direct, on continue vers la découverte HTML
    }

    let html: string;
    try {
      const res = await fetchWithTimeout(pageUrl);
      if (res.status === 403 || res.status === 429) {
        throw new HttpException(
          422,
          "Ce site bloque les requêtes automatisées. Essaie de coller directement l'URL du flux RSS (souvent /rss, /feed ou /feed.xml)."
        );
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(422, "Impossible d'accéder à ce site (hors ligne, trop lent, ou bloque les robots)");
    }

    const match =
      html.match(/<link[^>]+type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]*type=["']application\/rss\+xml["']/i) ||
      html.match(/<link[^>]+type=["']application\/atom\+xml["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]*type=["']application\/atom\+xml["']/i);

    if (!match) throw new HttpException(422, "Aucun flux RSS détecté sur ce site");

    const discovered = match[1];
    return discovered.startsWith("http") ? discovered : new URL(discovered, pageUrl).toString();
  }

  async resolveYoutubeFeedUrl(channelUrl: string): Promise<string> {
    const directMatch = channelUrl.match(/\/channel\/(UC[\w-]+)/);
    if (directMatch) {
      return `https://www.youtube.com/feeds/videos.xml?channel_id=${directMatch[1]}`;
    }

    let html: string;
    try {
      const res = await fetchWithTimeout(channelUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch {
      throw new HttpException(422, "Impossible d'accéder à cette chaîne YouTube");
    }

    const match =
      html.match(/"channelId":"(UC[\w-]+)"/) || html.match(/<meta itemprop="channelId" content="(UC[\w-]+)">/);
    if (!match) throw new HttpException(422, "Impossible de trouver l'identifiant de cette chaîne YouTube");

    return `https://www.youtube.com/feeds/videos.xml?channel_id=${match[1]}`;
  }

  private explainFailure(err: unknown): string {
    const message = err instanceof Error ? err.message : "";
    if (/403|forbidden/i.test(message)) {
      return "Ce site bloque les requêtes automatisées (403). Essaie de coller directement l'URL du flux RSS trouvée sur le site.";
    }
    if (/timeout|abort/i.test(message)) {
      return "Le site met trop de temps à répondre, réessaie plus tard.";
    }
    return "Impossible de lire ce flux RSS (format invalide ou inaccessible)";
  }
}