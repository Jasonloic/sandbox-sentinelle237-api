import Parser from "rss-parser";
import { HttpException } from "../utils/HttpExceptions";

const parser = new Parser();

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
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

async function fetchWithTimeout(url: string, timeoutMs = 12000, extraHeaders?: Record<string, string>): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: { ...BROWSER_HEADERS, ...extraHeaders },
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export class FeedParserService {
  /**
   * Parse un flux RSS/Atom en utilisant toujours nos headers personnalisés
   */
  async parseFeed(feedUrl: string): Promise<ParsedFeed> {
    try {
      const res = await fetchWithTimeout(feedUrl);
      if (res.status === 403 || res.status === 429) {
        throw new HttpException(
            422,
            "Ce site bloque les requêtes automatisées. Essaie de coller directement l'URL du flux RSS (souvent /rss, /feed ou /feed.xml)."
        );
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      return (await parser.parseString(xml)) as ParsedFeed;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(422, this.explainFailure(err));
    }
  }

  /**
   * Découvre l'URL du flux RSS sur une page web
   */
  async discoverFeedUrl(pageUrl: string): Promise<string> {
    // 1. Essayer directement si c'est déjà un flux
    try {
      await this.parseFeed(pageUrl);
      return pageUrl;
    } catch {
      // Ce n'est pas un flux direct, on continue
    }

    // 2. Récupérer le HTML de la page
    let html: string;
    try {
      const res = await fetchWithTimeout(pageUrl);
      if (res.status === 403 || res.status === 429) {
        // 3. Fallback : essayer les chemins communs si le HTML est bloqué
        return await this.tryCommonFeedPaths(pageUrl);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      if (err instanceof HttpException) throw err;
      // Si le site est down, essayer quand même les chemins communs
      try {
        return await this.tryCommonFeedPaths(pageUrl);
      } catch {
        throw new HttpException(422, "Impossible d'accéder à ce site (hors ligne, trop lent, ou bloque les robots)");
      }
    }

    // 4. Chercher <link rel="alternate" type="application/rss+xml"> dans le HTML
    const feedUrl = this.extractFeedUrlFromHtml(html, pageUrl);
    if (feedUrl) {
      // Vérifier que le flux découvert fonctionne réellement
      try {
        await this.parseFeed(feedUrl);
        return feedUrl;
      } catch {
        // Le lien dans le HTML est mort, essayer les chemins communs
        return await this.tryCommonFeedPaths(pageUrl);
      }
    }

    // 5. Dernier recours : chemins communs
    return await this.tryCommonFeedPaths(pageUrl);
  }

  /**
   * Essaie les chemins RSS les plus courants
   */
  private async tryCommonFeedPaths(baseUrl: string): Promise<string> {
    const url = new URL(baseUrl);
    const candidates = [
      "/rss",
      "/feed",
      "/feed.xml",
      "/rss.xml",
      "/index.xml",
      "/atom.xml",
      "/feeds/posts/default", // Blogger
      "/?feed=rss2", // WordPress legacy
    ];

    for (const path of candidates) {
      const candidate = new URL(path, url.origin).toString();
      try {
        await this.parseFeed(candidate);
        return candidate;
      } catch {
        continue;
      }
    }

    throw new HttpException(422, "Aucun flux RSS détecté sur ce site. Essaie de coller directement l'URL du flux.");
  }

  private extractFeedUrlFromHtml(html: string, baseUrl: string): string | null {
    const patterns = [
      /<link[^>]+type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]*type=["']application\/rss\+xml["']/i,
      /<link[^>]+type=["']application\/atom\+xml["'][^>]*href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]*type=["']application\/atom\+xml["']/i,
    ];

    for (const regex of patterns) {
      const match = html.match(regex);
      if (match) {
        const discovered = match[1];
        return discovered.startsWith("http") ? discovered : new URL(discovered, baseUrl).toString();
      }
    }
    return null;
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
        html.match(/"channelId":"(UC[\w-]+)"/) ||
        html.match(/<meta itemprop="channelId" content="(UC[\w-]+)">/);
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