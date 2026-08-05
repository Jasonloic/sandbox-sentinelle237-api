import "dotenv/config";
import { PrismaClient, Zone, FluxType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import Parser from "rss-parser";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const db = new PrismaClient({ adapter });
const parser = new Parser({ timeout: 15000 });

const { SEED_ADMIN_MAIL } = process.env as { [key: string]: string };

type CuratedFeed = { nom: string; lien_rss: string; zone?: Zone };

function withZone(zone: Zone | undefined, entries: { nom: string; lien_rss: string }[]): CuratedFeed[] {
  return entries.map((e) => ({ ...e, zone }));
}

function detectType(url: string): FluxType {
  return url.includes("youtube.com") ? FluxType.youtube : FluxType.rss;
}

const AUSTRALIA = [
  { nom: "Daily Telegraph AU", lien_rss: "https://www.dailytelegraph.com.au/news/breaking-news/rss" },
  { nom: "Sydney Morning Herald", lien_rss: "https://www.smh.com.au/rss/feed.xml" },
  { nom: "Herald Sun", lien_rss: "https://www.heraldsun.com.au/news/breaking-news/rss" },
  { nom: "ABC News Australia", lien_rss: "https://www.abc.net.au/news/feed/1948/rss.xml" },
  { nom: "The Age", lien_rss: "https://www.theage.com.au/rss/feed.xml" },
  { nom: "The Courier Mail", lien_rss: "https://www.couriermail.com.au/rss" },
  { nom: "PerthNow", lien_rss: "https://www.perthnow.com.au/news/feed" },
  { nom: "The Canberra Times", lien_rss: "https://www.canberratimes.com.au/rss.xml" },
  { nom: "Brisbane Times", lien_rss: "https://www.brisbanetimes.com.au/rss/feed.xml" },
  { nom: "Independent Australia", lien_rss: "http://feeds.feedburner.com/IndependentAustralia" },
  { nom: "Business News Australia", lien_rss: "https://www.businessnews.com.au/rssfeed/latest.rss" },
  { nom: "InDaily", lien_rss: "https://indaily.com.au/feed/" },
  { nom: "The Mercury", lien_rss: "https://www.themercury.com.au/rss" },
  { nom: "Crikey", lien_rss: "https://feeds.feedburner.com/com/rCTl" },
  { nom: "Michael West", lien_rss: "https://www.michaelwest.com.au/feed/" },
];

const BANGLADESH = [
  { nom: "The Daily Star", lien_rss: "https://www.thedailystar.net/frontpage/rss.xml" },
  { nom: "BD24Live", lien_rss: "https://www.bd24live.com/feed" },
  { nom: "bdnews24.com", lien_rss: "https://bdnews24.com/?widgetName=rssfeed&widgetId=1150&getXmlFeed=true" },
  { nom: "Bangla News 24", lien_rss: "https://www.banglanews24.com/rss/rss.xml" },
  { nom: "JUGANTOR", lien_rss: "https://www.jugantor.com/feed/rss.xml" },
  { nom: "jagonews24.com", lien_rss: "https://www.jagonews24.com/rss/rss.xml" },
  { nom: "Kalerkantho", lien_rss: "https://www.kalerkantho.com/rss.xml" },
  { nom: "প্রথম আলো", lien_rss: "https://www.prothomalo.com/feed/" },
];

const HONG_KONG = [
  { nom: "Hong Kong Free Press", lien_rss: "https://www.hongkongfp.com/feed/" },
  { nom: "The Standard HK", lien_rss: "https://www.thestandard.com.hk/newsfeed/latest/news.xml" },
  { nom: "頭條日報", lien_rss: "https://hd.stheadline.com/rss/news/daily/" },
  { nom: "香港經濟日報 hket.com", lien_rss: "https://www.hket.com/rss/hongkong" },
  { nom: "South China Morning Post", lien_rss: "https://www.scmp.com/rss/91/feed" },
  { nom: "hongkongnews.net", lien_rss: "http://feeds.hongkongnews.net/rss/b82693edf38ebff8" },
];

const INDONESIA = [
  { nom: "Republika Online", lien_rss: "https://www.republika.co.id/rss/" },
  { nom: "Tribunnews.com", lien_rss: "https://www.tribunnews.com/rss" },
  { nom: "Merdeka.com", lien_rss: "https://www.merdeka.com/feed/" },
  { nom: "Suara.com", lien_rss: "https://www.suara.com/rss" },
];

const INDIA = [
  { nom: "BBC News India", lien_rss: "http://feeds.bbci.co.uk/news/world/asia/india/rss.xml" },
  { nom: "The Guardian India", lien_rss: "https://www.theguardian.com/world/india/rss" },
  { nom: "Times of India", lien_rss: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms" },
  { nom: "The Hindu", lien_rss: "https://www.thehindu.com/feeder/default.rss" },
  { nom: "NDTV News", lien_rss: "https://feeds.feedburner.com/ndtvnews-top-stories" },
  { nom: "India Today", lien_rss: "https://www.indiatoday.in/rss/home" },
  { nom: "The Indian Express", lien_rss: "http://indianexpress.com/print/front-page/feed/" },
  { nom: "News18 World", lien_rss: "https://www.news18.com/rss/world.xml" },
  { nom: "DNA India", lien_rss: "https://www.dnaindia.com/feeds/india.xml" },
  { nom: "Firstpost India", lien_rss: "https://www.firstpost.com/rss/india.xml" },
  { nom: "Business Standard", lien_rss: "https://www.business-standard.com/rss/home_page_top_stories.rss" },
  { nom: "Outlook India", lien_rss: "https://www.outlookindia.com/rss/main/magazine" },
  { nom: "Free Press Journal", lien_rss: "https://www.freepressjournal.in/stories.rss" },
  { nom: "Deccan Chronicle", lien_rss: "https://www.deccanchronicle.com/rss_feed/" },
  { nom: "Moneycontrol", lien_rss: "http://www.moneycontrol.com/rss/latestnews.xml" },
  { nom: "Economic Times", lien_rss: "https://economictimes.indiatimes.com/rssfeedsdefault.cms" },
  { nom: "Oneindia", lien_rss: "https://www.oneindia.com/rss/news-fb.xml" },
  { nom: "Scroll.in", lien_rss: "http://feeds.feedburner.com/ScrollinArticles.rss" },
  { nom: "The Financial Express", lien_rss: "https://www.financialexpress.com/feed/" },
  { nom: "Business Line", lien_rss: "https://www.thehindubusinessline.com/feeder/default.rss" },
  { nom: "TechGenyz", lien_rss: "http://feeds.feedburner.com/techgenyz" },
  { nom: "Gujarat Samachar", lien_rss: "https://www.gujaratsamachar.com/rss/top-stories" },
  { nom: "Maharashtra Times", lien_rss: "https://maharashtratimes.com/rssfeedsdefault.cms" },
  { nom: "Loksatta", lien_rss: "https://www.loksatta.com/desh-videsh/feed/" },
  { nom: "News18 Lokmat", lien_rss: "https://lokmat.news18.com/rss/program.xml" },
  { nom: "OpIndia", lien_rss: "https://feeds.feedburner.com/opindia" },
  { nom: "ThePrint", lien_rss: "https://theprint.in/feed/" },
  { nom: "Swarajya", lien_rss: "https://prod-qt-images.s3.amazonaws.com/production/swarajya/feed.xml" },
  { nom: "Amar Ujala", lien_rss: "https://www.amarujala.com/rss/breaking-news.xml" },
  { nom: "Navbharat Times", lien_rss: "https://navbharattimes.indiatimes.com/rssfeedsdefault.cms" },
  { nom: "Patrika", lien_rss: "http://api.patrika.com/rss/india-news" },
  { nom: "Jansatta", lien_rss: "https://www.jansatta.com/feed/" },
  { nom: "Live Hindustan", lien_rss: "https://feed.livehindustan.com/rss/3127" },
  { nom: "Dainik Bhaskar", lien_rss: "https://www.bhaskar.com/rss-feed/1061/" },
  { nom: "Divya Bhaskar", lien_rss: "https://www.divyabhaskar.co.in/rss-feed/1037/" },
];

const IRAN = [
  { nom: "YJC", lien_rss: "https://www.yjc.ir/fa/rss/allnews" },
  { nom: "Tabnak", lien_rss: "https://www.tabnak.ir/fa/rss/allnews" },
  { nom: "ISNA", lien_rss: "https://www.isna.ir/rss" },
  { nom: "Mehr News", lien_rss: "https://www.mehrnews.com/rss" },
  { nom: "Khabaronline", lien_rss: "https://www.khabaronline.ir/rss" },
  {
    nom: "Tasnim News",
    lien_rss:
      "https://www.tasnimnews.com/fa/rss/feed/0/8/0/%D9%85%D9%87%D9%85%D8%AA%D8%B1%DB%8C%D9%86-%D8%A7%D8%AE%D8%A8%D8%A7%D8%B1-%D8%AA%D8%B3%D9%86%DB%8C%D9%85",
  },
  { nom: "Asr Iran", lien_rss: "https://www.asriran.com/fa/rss/allnews" },
];

const JAPAN = [
  { nom: "Japan Times", lien_rss: "https://www.japantimes.co.jp/feed/topstories/" },
  { nom: "Japan Today", lien_rss: "https://japantoday.com/feed" },
  { nom: "News On Japan", lien_rss: "http://www.newsonjapan.com/rss/top.xml" },
  { nom: "Kyodo News+", lien_rss: "https://english.kyodonews.net/rss/all.xml" },
  { nom: "BRIDGE", lien_rss: "http://feeds.feedburner.com/SdJapan" },
  {
    nom: "NYT Japan",
    lien_rss: "https://www.nytimes.com/svc/collections/v1/publish/http://www.nytimes.com/topic/destination/japan/rss.xml",
  },
  { nom: "ライブドアニュース", lien_rss: "https://news.livedoor.com/topics/rss/top.xml" },
  { nom: "朝日新聞デジタル", lien_rss: "http://rss.asahi.com/rss/asahi/newsheadlines.rdf" },
];

const MYANMAR = [
  { nom: "Myanmar Gazette", lien_rss: "http://myanmargazette.net/feed" },
  { nom: "DVB Multimedia Group", lien_rss: "http://www.dvb.no/feed" },
  { nom: "Thit Htoo Lwin", lien_rss: "http://www.thithtoolwin.com/feeds/posts/default" },
];

const PHILIPPINES = [
  { nom: "INQUIRER.net", lien_rss: "https://www.inquirer.net/fullfeed" },
  { nom: "Interaksyon", lien_rss: "https://www.interaksyon.com/feed/" },
  { nom: "philstar.com", lien_rss: "https://www.philstar.com/rss/headlines" },
  { nom: "BusinessWorld", lien_rss: "https://www.bworldonline.com/feed/" },
  { nom: "SunStar", lien_rss: "https://www.sunstar.com.ph/rssFeed/selected" },
  { nom: "PhilNews.XYZ", lien_rss: "https://www.philnews.xyz/feeds/posts/default?alt=rss" },
  { nom: "Manila Standard", lien_rss: "https://manilastandard.net/feed/all" },
  { nom: "GMA News Online", lien_rss: "https://data.gmanews.tv/gno/rss/news/feed.xml" },
  { nom: "Current PH", lien_rss: "https://currentph.com/feed/" },
  { nom: "Top Gear Philippines", lien_rss: "https://www.topgear.com.ph/feed/rss1" },
  { nom: "Eagle News", lien_rss: "https://www.eaglenews.ph/feed/" },
  { nom: "UNBOX PH", lien_rss: "https://www.unbox.ph/feed/" },
  { nom: "Tempo", lien_rss: "http://tempo.com.ph/feed/" },
  { nom: "Abante Tonite", lien_rss: "https://tonite.abante.com.ph/feed/" },
  { nom: "BusinessMirror", lien_rss: "https://businessmirror.com.ph/feed/" },
  { nom: "Philippine News Agency", lien_rss: "https://www.pna.gov.ph/latest.rss" },
  { nom: "TechPinas", lien_rss: "http://feeds.feedburner.com/Techpinas" },
  { nom: "Bicol Standard", lien_rss: "http://www.bicolstandard.com/feeds/posts/default?alt=rss" },
];

const PAKISTAN = [
  { nom: "The Express Tribune", lien_rss: "https://tribune.com.pk/feed/home" },
  { nom: "The Nation Pakistan", lien_rss: "https://nation.com.pk/rss/top-stories" },
  { nom: "Jang", lien_rss: "https://jang.com.pk/rss/1/1" },
  { nom: "The News International", lien_rss: "https://www.thenews.com.pk/rss/1/1" },
  { nom: "News n Blogs", lien_rss: "https://newsnblogs.com/feed/" },
  { nom: "UrduPoint", lien_rss: "https://www.urdupoint.com/rss/urdupoint.rss" },
  { nom: "Express Urdu", lien_rss: "https://www.express.pk/feed/" },
];

const GERMANY = [
  { nom: "ZEIT ONLINE", lien_rss: "http://newsfeed.zeit.de/index" },
  { nom: "FOCUS Online", lien_rss: "https://rss.focus.de/fol/XML/rss_folnews.xml" },
  { nom: "FAZ.NET", lien_rss: "https://www.faz.net/rss/aktuell/" },
  { nom: "tagesschau.de", lien_rss: "http://www.tagesschau.de/xml/rss2" },
  { nom: "Deutsche Welle", lien_rss: "https://rss.dw.com/rdf/rss-en-all" },
];

const SPAIN = [
  { nom: "The Local Spain", lien_rss: "https://feeds.thelocal.com/rss/es" },
  { nom: "EL PAÍS", lien_rss: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada" },
  { nom: "El Confidencial España", lien_rss: "https://rss.elconfidencial.com/espana/" },
  { nom: "ElDiario.es", lien_rss: "https://www.eldiario.es/rss/" },
  { nom: "Expansión", lien_rss: "https://e00-expansion.uecdn.es/rss/portada.xml" },
  { nom: "El Periódico", lien_rss: "https://www.elperiodico.com/es/rss/rss_portada.xml" },
  { nom: "HuffPost España", lien_rss: "https://www.huffingtonpost.es/feeds/index.xml" },
  { nom: "Euro Weekly News Spain", lien_rss: "https://www.euroweeklynews.com/feed/" },
  { nom: "Agencia EFE (English)", lien_rss: "https://www.efe.com/efe/english/4/rss" },
];

const FRANCE = [
  { nom: "France24 EN", lien_rss: "https://www.france24.com/en/rss" },
  { nom: "Mediapart", lien_rss: "https://www.mediapart.fr/articles/feed" },
  { nom: "Paris Star", lien_rss: "https://www.parisstaronline.com/feed" },
  { nom: "Le Monde.fr - Une", lien_rss: "https://www.lemonde.fr/rss/une.xml" },
  { nom: "L'Obs", lien_rss: "https://www.nouvelobs.com/a-la-une/rss.xml" },
  { nom: "Franceinfo", lien_rss: "https://www.francetvinfo.fr/titres.rss" },
  { nom: "Le Huffington Post FR", lien_rss: "https://www.huffingtonpost.fr/feeds/index.xml" },
  { nom: "La Dépêche du Midi", lien_rss: "https://www.ladepeche.fr/rss.xml" },
  { nom: "Diplomatie.gouv.fr", lien_rss: "https://www.diplomatie.gouv.fr/spip.php?page=backend-fd&lang=en" },
  { nom: "L'essentiel (Sud Ouest)", lien_rss: "https://www.sudouest.fr/essentiel/rss.xml" },
  { nom: "Ouest-France", lien_rss: "https://www.ouest-france.fr/rss-en-continu.xml" },
];

const UK = [
  { nom: "BBC News Home", lien_rss: "http://feeds.bbci.co.uk/news/rss.xml" },
  { nom: "The Guardian World", lien_rss: "https://www.theguardian.com/world/rss" },
  { nom: "Daily Mail", lien_rss: "https://www.dailymail.co.uk/home/index.rss" },
  { nom: "The Independent UK", lien_rss: "http://www.independent.co.uk/news/uk/rss" },
  { nom: "Daily Express", lien_rss: "http://feeds.feedburner.com/daily-express-news-showbiz" },
];

const IRELAND = [
  { nom: "TheJournal.ie", lien_rss: "https://www.thejournal.ie/feed/" },
  { nom: "BreakingNews.ie", lien_rss: "https://feeds.breakingnews.ie/bntopstories" },
  { nom: "The42", lien_rss: "https://www.the42.ie/feed/" },
  { nom: "IrishExaminer.com", lien_rss: "https://feeds.feedburner.com/ietopstories" },
  { nom: "IrishCentral.com", lien_rss: "https://feeds.feedburner.com/IrishCentral" },
  { nom: "Irish Mirror", lien_rss: "https://www.irishmirror.ie/?service=rss" },
];

const ITALY = [
  { nom: "ANSA.it", lien_rss: "https://www.ansa.it/sito/ansait_rss.xml" },
  { nom: "The Local Italy", lien_rss: "https://feeds.thelocal.com/rss/it" },
  { nom: "DiariodelWeb.it", lien_rss: "https://www.diariodelweb.it/rss/home/" },
  { nom: "Fanpage", lien_rss: "https://www.fanpage.it/feed/" },
  { nom: "Libero Quotidiano", lien_rss: "https://www.liberoquotidiano.it/rss.xml" },
  { nom: "Il Mattino", lien_rss: "https://www.ilmattino.it/?sez=XML&args&p=search&args[box]=Home&limit=20&layout=rss" },
  { nom: "Adnkronos", lien_rss: "http://rss.adnkronos.com/RSS_PrimaPagina.xml" },
  { nom: "Milan News", lien_rss: "https://www.milannews.it/rss/" },
  { nom: "Internazionale", lien_rss: "https://www.internazionale.it/sitemaps/rss.xml" },
  { nom: "Panorama", lien_rss: "https://www.panorama.it/feeds/feed.rss" },
  { nom: "The Guardian Italy", lien_rss: "https://www.theguardian.com/world/italy/rss" },
  { nom: "Repubblica.it", lien_rss: "https://www.repubblica.it/rss/homepage/rss2.0.xml" },
  { nom: "Il Post", lien_rss: "https://www.ilpost.it/feed/" },
];

const POLAND = [
  { nom: "wPolityce", lien_rss: "http://feeds.feedburner.com/wPolitycepl" },
  { nom: "Newsweek Polska", lien_rss: "https://www.newsweek.pl/rss.xml" },
  { nom: "Dziennik.pl", lien_rss: "http://rss.dziennik.pl/Dziennik-PL/" },
  { nom: "Wirtualnemedia.pl", lien_rss: "https://www.wirtualnemedia.pl/rss/wirtualnemedia_rss.xml" },
  { nom: "GazetaPrawna.pl", lien_rss: "http://rss.gazetaprawna.pl/GazetaPrawna" },
  { nom: "Rzeczpospolita", lien_rss: "https://www.rp.pl/rss/1019" },
  { nom: "PAP", lien_rss: "https://www.pap.pl/rss.xml" },
  { nom: "RMF24.pl", lien_rss: "https://www.rmf24.pl/feed" },
];

const RUSSIA = [
  { nom: "Lenta.ru", lien_rss: "https://lenta.ru/rss" },
  { nom: "Vesti.ru", lien_rss: "https://www.vesti.ru/vesti.rss" },
  { nom: "Gazeta.ru", lien_rss: "https://www.gazeta.ru/export/rss/first.xml" },
  { nom: "MK.ru", lien_rss: "https://www.mk.ru/rss/index.xml" },
  { nom: "Rossiyskaya Gazeta", lien_rss: "https://rg.ru/xml/index.xml" },
  { nom: "NEWSru.com", lien_rss: "https://rss.newsru.com/top/big/" },
  { nom: "RT", lien_rss: "https://www.rt.com/rss/" },
  { nom: "Meduza.io", lien_rss: "https://meduza.io/rss/all" },
  { nom: "Russia Insider", lien_rss: "https://russia-insider.com/en/all-content/rss" },
  { nom: "TASS", lien_rss: "http://tass.com/rss/v2.xml" },
  { nom: "The Moscow Times", lien_rss: "https://www.themoscowtimes.com/rss/news" },
  { nom: "Kommersant", lien_rss: "https://www.kommersant.ru/RSS/main.xml" },
  { nom: "PravdaReport", lien_rss: "https://www.pravdareport.com/export.xml" },
];

const UKRAINE = [
  { nom: "UNIAN (EN)", lien_rss: "https://rss.unian.net/site/news_eng.rss" },
  { nom: "Telegraf.ua", lien_rss: "https://telegraf.com.ua/yandex-feed/" },
  { nom: "Korrespondent.net", lien_rss: "http://k.img.com.ua/rss/ru/all_news2.0.xml" },
  { nom: "Tsenzor.net", lien_rss: "https://censor.net.ua/includes/news_ru.xml" },
  { nom: "TSN.ua", lien_rss: "https://tsn.ua/rss/full.rss" },
  { nom: "Ukrainska Pravda", lien_rss: "https://www.pravda.com.ua/rss/" },
  { nom: "Gordon", lien_rss: "https://gordonua.com/xml/rss_category/top.html" },
  { nom: "NV.ua", lien_rss: "https://nv.ua/rss/all.xml" },
  { nom: "UNIAN (RU)", lien_rss: "https://rss.unian.net/site/news_rus.rss" },
  { nom: "Espreso.tv", lien_rss: "https://espreso.tv/rss" },
  { nom: "Gazeta.ua", lien_rss: "https://gazeta.ua/rss" },
  { nom: "Vesti.ua", lien_rss: "https://vesti.ua/feeds/partners" },
];

const BRAZIL = [
  { nom: "Folha de S.Paulo", lien_rss: "https://feeds.folha.uol.com.br/emcimadahora/rss091.xml" },
  { nom: "Portal EBC", lien_rss: "http://www.ebc.com.br/rss/feed.xml" },
  { nom: "R7 Notícias", lien_rss: "https://noticias.r7.com/feed.xml" },
  { nom: "UOL", lien_rss: "http://rss.home.uol.com.br/index.xml" },
  { nom: "The Rio Times", lien_rss: "https://riotimesonline.com/feed/" },
  { nom: "Brasil Wire", lien_rss: "http://www.brasilwire.com/feed/" },
  { nom: "Jornal de Brasília", lien_rss: "https://jornaldebrasilia.com.br/feed/" },
];

const CANADA = [
  { nom: "CBC Top Stories", lien_rss: "https://www.cbc.ca/cmlink/rss-topstories" },
  { nom: "CTVNews.ca", lien_rss: "https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009" },
  { nom: "Global News", lien_rss: "https://globalnews.ca/feed/" },
  { nom: "Financial Post", lien_rss: "https://business.financialpost.com/feed/" },
  { nom: "National Post", lien_rss: "https://nationalpost.com/feed/" },
  { nom: "Ottawa Citizen", lien_rss: "https://ottawacitizen.com/feed/" },
  { nom: "The Province", lien_rss: "https://theprovince.com/feed/" },
  { nom: "LaPresse.ca", lien_rss: "https://www.lapresse.ca/actualites/rss" },
  { nom: "Toronto Star", lien_rss: "https://www.thestar.com/content/thestar/feed.RSSManagerServlet.articles.topstories.rss" },
  { nom: "Toronto Sun", lien_rss: "https://torontosun.com/category/news/feed" },
];

const MEXICO = [
  { nom: "The Guardian Mexico", lien_rss: "https://www.theguardian.com/world/mexico/rss" },
  { nom: "Excélsior", lien_rss: "https://www.excelsior.com.mx/rss.xml" },
  { nom: "Reforma", lien_rss: "https://www.reforma.com/rss/portada.xml" },
  { nom: "Vanguardia MX", lien_rss: "https://vanguardia.com.mx/rss.xml" },
  { nom: "El Siglo de Torreón", lien_rss: "https://www.elsiglodetorreon.com.mx/index.xml" },
  { nom: "El Financiero", lien_rss: "https://www.elfinanciero.com.mx/arc/outboundfeeds/rss/?outputType=xml" },
  { nom: "ElNorte", lien_rss: "https://www.elnorte.com/rss/portada.xml" },
  { nom: "El Informador", lien_rss: "https://www.informador.mx/rss/ultimas-noticias.xml" },
  { nom: "24 Horas MX", lien_rss: "https://www.24-horas.mx/feed/" },
  { nom: "DEBATE", lien_rss: "https://www.debate.com.mx/rss/feed.xml" },
  { nom: "Mexico News Daily", lien_rss: "https://mexiconewsdaily.com/feed/" },
  { nom: "El Diario (Juárez)", lien_rss: "https://diario.mx/jrz/media/sitemaps/rss.xml" },
  { nom: "8 Columnas", lien_rss: "https://8columnas.com.mx/feed/" },
  { nom: "El Universal MX", lien_rss: "https://www.eluniversal.com.mx/seccion/1671/rss.xml" },
];

const UNITED_STATES = [
  { nom: "HuffPost World News", lien_rss: "https://www.huffpost.com/section/world-news/feed" },
  { nom: "NYT Top Stories", lien_rss: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" },
  { nom: "FOX News", lien_rss: "http://feeds.foxnews.com/foxnews/latest" },
  { nom: "Washington Post World", lien_rss: "http://feeds.washingtonpost.com/rss/world" },
  { nom: "WSJ World News", lien_rss: "https://feeds.a.dj.com/rss/RSSWorldNews.xml" },
  { nom: "LA Times World & Nation", lien_rss: "https://www.latimes.com/world-nation/rss2.0.xml" },
  { nom: "CNN International", lien_rss: "http://rss.cnn.com/rss/edition.rss" },
  { nom: "Yahoo News", lien_rss: "https://news.yahoo.com/rss/mostviewed" },
  { nom: "CNBC US Top News", lien_rss: "https://www.cnbc.com/id/100003114/device/rss/rss.html" },
  { nom: "Politico Playbook", lien_rss: "https://rss.politico.com/playbook.xml" },
];

const NIGERIA = [
  { nom: "Sahara Reporters", lien_rss: "http://saharareporters.com/feeds/latest/feed" },
  { nom: "Nigerian Bulletin", lien_rss: "https://www.nigerianbulletin.com/forums/-/index.rss" },
  { nom: "Nigerianeye", lien_rss: "http://feeds.feedburner.com/Nigerianeye" },
  { nom: "Legit.ng", lien_rss: "https://www.legit.ng/rss/all.rss" },
  { nom: "The Nation Nigeria", lien_rss: "https://thenationonlineng.net/feed/" },
  { nom: "Daily Post Nigeria", lien_rss: "https://dailypost.ng/feed" },
  { nom: "Premium Times Nigeria", lien_rss: "https://www.premiumtimesng.com/feed" },
  { nom: "Information Nigeria", lien_rss: "https://www.informationng.com/feed" },
  { nom: "The Guardian Nigeria", lien_rss: "https://guardian.ng/feed/" },
  { nom: "Tribune Online", lien_rss: "http://tribuneonlineng.com/feed/" },
];

const SOUTH_AFRICA = [
  { nom: "SowetanLIVE", lien_rss: "https://www.sowetanlive.co.za/rss/?publication=sowetan-live" },
  { nom: "BusinessTech", lien_rss: "https://businesstech.co.za/news/feed/" },
  { nom: "TechCentral", lien_rss: "https://techcentral.co.za/feed" },
  { nom: "News24 Top Stories", lien_rss: "http://feeds.news24.com/articles/news24/TopStories/rss" },
  { nom: "Eyewitness News", lien_rss: "https://ewn.co.za/RSS%20Feeds/Latest%20News" },
  { nom: "The Citizen", lien_rss: "https://citizen.co.za/feed/" },
  { nom: "Daily Maverick", lien_rss: "https://www.dailymaverick.co.za/dmrss/" },
  { nom: "Moneyweb", lien_rss: "https://www.moneyweb.co.za/feed/" },
  { nom: "IOL News", lien_rss: "http://rss.iol.io/iol/news" },
  { nom: "TimesLIVE", lien_rss: "https://www.timeslive.co.za/rss/" },
  { nom: "The South African", lien_rss: "https://www.thesouthafrican.com/feed/" },
  { nom: "Axios", lien_rss: "https://api.axios.com/feed/" },
];

const ANDROID = [
  { nom: "All About Android (Audio)", lien_rss: "https://feeds.twit.tv/aaa.xml" },
  { nom: "Android (Google Blog)", lien_rss: "https://blog.google/products/android/rss" },
  { nom: "r/android", lien_rss: "https://www.reddit.com/r/android/.rss" },
  { nom: "Android Authority", lien_rss: "https://www.androidauthority.com/feed" },
  { nom: "Android Authority (YouTube)", lien_rss: "https://www.youtube.com/feeds/videos.xml?user=AndroidAuthority" },
  { nom: "Android Authority Podcast", lien_rss: "https://androidauthority.libsyn.com/rss" },
  { nom: "Android Central", lien_rss: "http://feeds.androidcentral.com/androidcentral" },
  { nom: "Android Central Podcast", lien_rss: "http://feeds.feedburner.com/AndroidCentralPodcast" },
  { nom: "Android Community", lien_rss: "https://androidcommunity.com/feed/" },
  { nom: "Android Police", lien_rss: "http://feeds.feedburner.com/AndroidPolice" },
  { nom: "AndroidGuys", lien_rss: "https://www.androidguys.com/feed" },
  { nom: "Cult of Android", lien_rss: "https://www.cultofandroid.com/feed" },
  { nom: "Cyanogen Mods", lien_rss: "https://www.cyanogenmods.org/feed" },
  { nom: "Droid Life", lien_rss: "https://www.droid-life.com/feed" },
  { nom: "GSMArena", lien_rss: "https://www.gsmarena.com/rss-news-reviews.php3" },
  { nom: "Phandroid", lien_rss: "http://feeds2.feedburner.com/AndroidPhoneFans" },
  { nom: "TalkAndroid", lien_rss: "http://feeds.feedburner.com/AndroidNewsGoogleAndroidForums" },
  { nom: "xda-developers", lien_rss: "https://data.xda-developers.com/portal-feed" },
];

const ANDROID_DEV = [
  { nom: "Android - Buffer Resources", lien_rss: "https://buffer.com/resources/android/rss/" },
  { nom: "Android Developers (YouTube)", lien_rss: "https://www.youtube.com/feeds/videos.xml?user=androiddevelopers" },
  { nom: "Android Developers - Medium", lien_rss: "https://medium.com/feed/androiddevelopers" },
  { nom: "Android Developers Backstage", lien_rss: "http://feeds.feedburner.com/blogspot/androiddevelopersbackstage" },
  { nom: "Android Developers Blog", lien_rss: "http://feeds.feedburner.com/blogspot/hsDu" },
  { nom: "Android Weekly Archive", lien_rss: "https://us2.campaign-archive.com/feed?u=887caf4f48db76fd91e20a06d&id=4eb677ad19" },
  { nom: "Instagram Engineering (Android)", lien_rss: "https://instagram-engineering.com/feed/tagged/android" },
  { nom: "MindOrks (Android)", lien_rss: "https://medium.com/feed/mindorks/tagged/android" },
  { nom: "Airbnb Tech (Android)", lien_rss: "https://medium.com/feed/airbnb-engineering/tagged/android" },
  { nom: "Dan Lew Codes", lien_rss: "https://blog.danlew.net/rss/" },
  { nom: "r/androiddev", lien_rss: "https://reddit.com/r/androiddev.rss" },
  { nom: "Fragmented Podcast", lien_rss: "https://feeds.simplecast.com/LpAGSLnY" },
  { nom: "Handstand Sam", lien_rss: "https://handstandsam.com/feed/" },
  { nom: "Jake Wharton", lien_rss: "https://jakewharton.com/atom.xml" },
  { nom: "JetBrains Blog", lien_rss: "https://blog.jetbrains.com/blog/feed" },
  { nom: "Joe Birch", lien_rss: "https://joebirch.co/feed" },
  { nom: "Kotlin (YouTube)", lien_rss: "https://www.youtube.com/feeds/videos.xml?playlist_id=PLQ176FUIyIUa6SChjajjVc-LMzxWiz6dy" },
  { nom: "Kt. Academy - Medium", lien_rss: "https://blog.kotlin-academy.com/feed" },
  { nom: "OkKotlin", lien_rss: "https://okkotlin.com/rss.xml" },
  { nom: "ProAndroidDev", lien_rss: "https://proandroiddev.com/feed" },
  { nom: "Public Object", lien_rss: "https://publicobject.com/rss/" },
  { nom: "Saket Narayan", lien_rss: "https://saket.me/feed/" },
  { nom: "Styling Android", lien_rss: "http://feeds.feedburner.com/StylingAndroid" },
  { nom: "Talking Kotlin", lien_rss: "https://feeds.soundcloud.com/users/soundcloud:users:280353173/sounds.rss" },
  { nom: "The Android Arsenal", lien_rss: "https://feeds.feedburner.com/Android_Arsenal" },
  { nom: "Zac Sweers", lien_rss: "https://www.zacsweers.dev/rss/" },
  { nom: "Zarah Dominguez", lien_rss: "https://zarah.dev/feed.xml" },
  { nom: "chRyNaN Codes", lien_rss: "https://chrynan.codes/rss/" },
  { nom: "droidcon NYC", lien_rss: "https://www.youtube.com/feeds/videos.xml?channel_id=UCSLXy31j2Z0sdDeeAX5JpPw" },
  { nom: "droidcon SF", lien_rss: "https://www.youtube.com/feeds/videos.xml?channel_id=UCKubKoe1CBw_-n_GXetEQbg" },
  { nom: "goobar", lien_rss: "https://goobar.io/feed" },
  { nom: "zsmb.co", lien_rss: "https://zsmb.co/index.xml" },
];

const APPLE = [
  { nom: "9to5Mac", lien_rss: "https://9to5mac.com/feed" },
  { nom: "Apple (YouTube)", lien_rss: "https://www.youtube.com/feeds/videos.xml?user=Apple" },
  { nom: "Apple Newsroom", lien_rss: "https://www.apple.com/newsroom/rss-feed.rss" },
  { nom: "AppleInsider News", lien_rss: "https://appleinsider.com/rss/news/" },
  { nom: "Cult of Mac", lien_rss: "https://www.cultofmac.com/feed" },
  { nom: "Daring Fireball", lien_rss: "https://daringfireball.net/feeds/main" },
  { nom: "MacRumors (YouTube)", lien_rss: "https://www.youtube.com/feeds/videos.xml?user=macrumors" },
  { nom: "MacRumors", lien_rss: "http://feeds.macrumors.com/MacRumors-Mac" },
  { nom: "MacStories", lien_rss: "https://www.macstories.net/feed" },
  { nom: "Macworld.com", lien_rss: "https://www.macworld.com/index.rss" },
  { nom: "Marco.org", lien_rss: "https://marco.org/rss" },
  { nom: "OS X Daily", lien_rss: "http://feeds.feedburner.com/osxdaily" },
  { nom: "The Loop", lien_rss: "https://www.loopinsight.com/feed" },
  { nom: "r/apple", lien_rss: "https://www.reddit.com/r/apple/.rss" },
  { nom: "r/iPhone", lien_rss: "https://www.reddit.com/r/iphone/.rss" },
];

const ARCHITECTURE = [
  { nom: "A Daily Dose of Architecture Books", lien_rss: "http://feeds.feedburner.com/archidose" },
  { nom: "ArchDaily", lien_rss: "http://feeds.feedburner.com/Archdaily" },
  { nom: "Archinect News", lien_rss: "https://archinect.com/feed/1/news" },
  { nom: "Architectural Digest", lien_rss: "https://www.architecturaldigest.com/feed/rss" },
  { nom: "Architectural Digest (YouTube)", lien_rss: "https://www.youtube.com/feeds/videos.xml?user=ArchitecturalDigest" },
  { nom: "r/architecture", lien_rss: "https://www.reddit.com/r/architecture/.rss" },
  { nom: "Dezeen Architecture", lien_rss: "https://www.dezeen.com/architecture/feed/" },
  { nom: "CONTEMPORIST", lien_rss: "https://www.contemporist.com/feed/" },
  { nom: "Inhabitat Architecture", lien_rss: "https://inhabitat.com/architecture/feed/" },
  { nom: "Design Milk Architecture", lien_rss: "https://design-milk.com/category/architecture/feed/" },
  { nom: "Architizer Journal", lien_rss: "https://architizer.wpengine.com/feed/" },
  { nom: "Living Big In A Tiny House", lien_rss: "https://www.youtube.com/feeds/videos.xml?user=livingbigtinyhouse" },
  { nom: "The Architect's Newspaper", lien_rss: "https://archpaper.com/feed" },
  { nom: "Designboom Architecture", lien_rss: "https://www.designboom.com/architecture/feed/" },
];

const BEAUTY = [
  { nom: "ELLE Beauty", lien_rss: "https://www.elle.com/rss/beauty.xml/" },
  { nom: "Fashionista Beauty", lien_rss: "https://fashionista.com/.rss/excerpt/beauty" },
  { nom: "FashionLady Beauty", lien_rss: "https://www.fashionlady.in/category/beauty-tips/feed" },
  { nom: "The Beauty Brains", lien_rss: "https://thebeautybrains.com/blog/feed/" },
  { nom: "DORÉ", lien_rss: "https://www.wearedore.com/feed" },
  { nom: "From Head To Toe", lien_rss: "http://feeds.feedburner.com/frmheadtotoe" },
  { nom: "Into The Gloss", lien_rss: "https://feeds.feedburner.com/intothegloss/oqoU" },
  { nom: "Makeup and Beauty Blog", lien_rss: "https://www.makeupandbeautyblog.com/feed/" },
  { nom: "POPSUGAR Beauty", lien_rss: "https://www.popsugar.com/beauty/feed" },
  { nom: "Refinery29 Beauty", lien_rss: "https://www.refinery29.com/beauty/rss.xml" },
  { nom: "YesStyle Beauty Blog", lien_rss: "https://www.yesstyle.com/blog/category/the-beauty-blog/feed/" },
  { nom: "The Beauty Look Book", lien_rss: "https://thebeautylookbook.com/feed" },
];

const BOOKS = [
  { nom: "A year of reading the world", lien_rss: "https://ayearofreadingtheworld.com/feed/" },
  { nom: "Aestas Book Blog", lien_rss: "https://aestasbookblog.com/feed/" },
  { nom: "BOOK RIOT", lien_rss: "https://bookriot.com/feed/" },
  { nom: "Kirkus Reviews", lien_rss: "https://www.kirkusreviews.com/feeds/rss/" },
  { nom: "NewInBooks", lien_rss: "https://www.newinbooks.com/feed/" },
  { nom: "r/books", lien_rss: "https://reddit.com/r/books/.rss" },
  { nom: "Wokeread", lien_rss: "https://wokeread.home.blog/feed/" },
];

const BUSINESS = [
  { nom: "Investing.com News", lien_rss: "https://www.investing.com/rss/news.rss" },
  { nom: "Bloomberg Quicktake (YouTube)", lien_rss: "https://www.youtube.com/feeds/videos.xml?user=Bloomberg" },
  { nom: "Seeking Alpha Market Currents", lien_rss: "https://seekingalpha.com/market_currents.xml" },
  { nom: "Business Insider (YouTube)", lien_rss: "https://www.youtube.com/feeds/videos.xml?user=businessinsider" },
  { nom: "Duct Tape Marketing", lien_rss: "https://ducttape.libsyn.com/rss" },
  { nom: "Forbes Business", lien_rss: "https://www.forbes.com/business/feed/" },
  { nom: "Fortune", lien_rss: "https://fortune.com/feed" },
  { nom: "HBR IdeaCast", lien_rss: "http://feeds.harvardbusiness.org/harvardbusiness/ideacast" },
  { nom: "How I Built This", lien_rss: "https://feeds.npr.org/510313/podcast.xml" },
  { nom: "Mixergy", lien_rss: "https://feeds.feedburner.com/Mixergy-main-podcast" },
  { nom: "Tim Ferriss Blog", lien_rss: "https://tim.blog/feed/" },
  { nom: "The Growth Show", lien_rss: "http://thegrowthshow.hubspot.libsynpro.com/" },
  { nom: "Yahoo Finance", lien_rss: "https://finance.yahoo.com/news/rssindex" },
];

const CURATED_FEEDS: CuratedFeed[] = [
  ...withZone(Zone.oceanie, AUSTRALIA),
  ...withZone(Zone.asie, BANGLADESH),
  ...withZone(Zone.asie, HONG_KONG),
  ...withZone(Zone.asie, INDONESIA),
  ...withZone(Zone.asie, INDIA),
  ...withZone(Zone.asie, IRAN),
  ...withZone(Zone.asie, JAPAN),
  ...withZone(Zone.asie, MYANMAR),
  ...withZone(Zone.asie, PHILIPPINES),
  ...withZone(Zone.asie, PAKISTAN),
  ...withZone(Zone.europe, GERMANY),
  ...withZone(Zone.europe, SPAIN),
  ...withZone(Zone.europe, FRANCE),
  ...withZone(Zone.europe, UK),
  ...withZone(Zone.europe, IRELAND),
  ...withZone(Zone.europe, ITALY),
  ...withZone(Zone.europe, POLAND),
  ...withZone(Zone.europe, RUSSIA),
  ...withZone(Zone.europe, UKRAINE),
  ...withZone(Zone.amerique, BRAZIL),
  ...withZone(Zone.amerique, CANADA),
  ...withZone(Zone.amerique, MEXICO),
  ...withZone(Zone.amerique, UNITED_STATES),
  ...withZone(Zone.afrique, NIGERIA),
  ...withZone(Zone.afrique, SOUTH_AFRICA),
  ...withZone(Zone.afrique, [
    { nom: "RFI Afrique", lien_rss: "https://www.rfi.fr/afrique/rss" },
    { nom: "Jeune Afrique", lien_rss: "https://www.jeuneafrique.com/feed/" },
    { nom: "BBC Afrique", lien_rss: "https://www.bbc.com/afrique/index.xml" },
    { nom: "Cameroon Tribune", lien_rss: "https://www.cameroon-tribune.cm/rss" },
    { nom: "Journal du Cameroun", lien_rss: "https://www.journalducameroun.com/feed/" },
    { nom: "Actu Cameroun", lien_rss: "https://actucameroun.com/feed/" },
    { nom: "AllAfrica", lien_rss: "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf" },
  ]),
  ...withZone(Zone.international, [
    { nom: "RFI Monde", lien_rss: "https://www.rfi.fr/fr/rss" },
    { nom: "BBC World News", lien_rss: "https://feeds.bbci.co.uk/news/world/rss.xml" },
    { nom: "Le Monde Diplomatique", lien_rss: "https://www.monde-diplomatique.fr/rss" },
  ]),
  ...withZone(undefined, ANDROID),
  ...withZone(undefined, ANDROID_DEV),
  ...withZone(undefined, APPLE),
  ...withZone(undefined, ARCHITECTURE),
  ...withZone(undefined, BEAUTY),
  ...withZone(undefined, BOOKS),
  ...withZone(undefined, BUSINESS),
];

async function main() {
  const admin = await db.user.findUnique({ where: { mail: SEED_ADMIN_MAIL } });
  if (!admin) {
    console.error("Aucun admin trouvé. Lance d'abord le seed admin (npx ts-node prisma/seed.ts).");
    return;
  }

  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (const feed of CURATED_FEEDS) {
    const existing = await db.flux.findUnique({ where: { lien_rss: feed.lien_rss } });
    if (existing) {
      skipped++;
      continue;
    }

    try {
      const parsed = await parser.parseURL(feed.lien_rss);

      const flux = await db.flux.create({
        data: {
          nom: feed.nom,
          url_site: parsed.link ?? null,
          lien_rss: feed.lien_rss,
          logo: (parsed as any).image?.url ?? null,
          type: detectType(feed.lien_rss),
          zone: feed.zone ?? null,
          is_suggestion: true,
          last_crawled_at: new Date(),
          created_by: admin.id_user,
        },
      });

      const articlesData = (parsed.items ?? [])
        .filter((item) => !!item.link)
        .map((item) => ({
          flux_id: flux.id_flux,
          titre: item.title ?? "Sans titre",
          lien: item.link as string,
          description: item.contentSnippet ?? item.content ?? null,
          date_publication: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : null,
        }));

      if (articlesData.length > 0) {
        await db.article.createMany({ data: articlesData, skipDuplicates: true });
      }

      console.log(`Ajouté : ${feed.nom} (${articlesData.length} articles)`);
      added++;
    } catch (err) {
      console.error(`Échec pour "${feed.nom}" (${feed.lien_rss}) :`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log(`\n── Résumé ──`);
  console.log(`Total tenté : ${CURATED_FEEDS.length}`);
  console.log(`Ajoutés : ${added}`);
  console.log(`Déjà présents (ignorés) : ${skipped}`);
  console.log(`Échecs : ${failed}`);
}

main()
  .catch((err) => {
    console.error("Erreur pendant le seed des flux :", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });