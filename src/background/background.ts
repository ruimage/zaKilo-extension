enum Script {
  OZON = "src/content/ozon.js",
  AUCHAN = "src/content/auchan.js",
  DELIVERY_CLUB = "src/content/delivery_club.js",
  KUPER = "src/content/kuper.js",
  MAGNIT = "src/content/magnit.js",
  PEREKRESTOK = "src/content/perekrestok.js",
  PYATEROCHKA = "src/content/pyaterochka.js",
  SAMOKAT = "src/content/samokat.js"
}

interface SiteConfig {
  match: string[];
  script: Script;
}

const api = typeof browser !== "undefined" ? browser : chrome;

const siteMap: SiteConfig[] = [
  {
    match: ["*://*.ozon.ru/*"],
    script: Script.OZON,
  },
  {
    match: ["*://*.auchan.ru/*"],
    script: Script.AUCHAN,
  },
  {
    match: ["*://market-delivery.yandex.ru/*"],
    script: Script.DELIVERY_CLUB,
  },
  {
    match: ["*://eda.yandex.ru/*"],
    script: Script.DELIVERY_CLUB,
  },
  {
    match: ["*://kuper.ru/*"],
    script: Script.KUPER,
  },
  {
    match: ["*://magnit.ru/*"],
    script: Script.MAGNIT,
  },
  {
    match: ["*://*.perekrestok.ru/*"],
    script: Script.PEREKRESTOK,
  },
  {
    match: ["*://5ka.ru/*"],
    script: Script.PYATEROCHKA,
  },
  {
    match: ["*://samokat.ru/*"],
    script: Script.SAMOKAT,
  },
];

function matches(url: string, patterns: string[]): boolean {
  return patterns.some((p) => new RegExp("^" + p.replace(/\*/g, ".*") + "$").test(url));
}

// инъекция с учётом Firefox
async function inject(tabId: number, files: string[]): Promise<void> {
  if (api.scripting && api.scripting.executeScript) {
    await api.scripting.executeScript({ target: { tabId }, files });
  } else {
    for (const file of files) {
      await api.tabs.executeScript(tabId, { file });
    }
  }
}

api.tabs.onUpdated.addListener((tabId: number, changeInfo, tab): void => {
  if (changeInfo.status !== "complete" || !tab.url) return;
  for (const site of siteMap) {
    if (matches(tab.url, site.match)) {
      inject(tabId, [site.script])
        .then(() => console.log(`Injected ${site.script} into ${tab.url}`))
        .catch((err) => console.error("Injection failed:", err));
      break;
    }
  }
});
