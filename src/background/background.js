const api = typeof browser !== "undefined" ? browser : chrome;

const siteMap = [
  {
    match: ["*://*.auchan.ru/*"],
    script: "src/content/auchan.js",
  },
  {
    match: ["*://market-delivery.yandex.ru/*"],
    script: "src/content/delivery_club.js",
  },
  {
    match: ["*://eda.yandex.ru/*"],
    script: "src/content/delivery_club.js",
  },
  {
    match: ["*://kuper.ru/*"],
    script: "src/content/kuper.js",
  },
  {
    match: ["*://magnit.ru/*"],
    script: "src/content/magnit.js",
  },
  {
    match: ["*://*.perekrestok.ru/*"],
    script: "src/content/perekrestok.js",
  },
  {
    match: ["*://5ka.ru/*"],
    script: "src/content/pyaterochka.js",
  },
  {
    match: ["*://samokat.ru/*"],
    script: "src/content/samokat.js",
  },
];

function matches(url, patterns) {
  return patterns.some((p) => new RegExp("^" + p.replace(/\*/g, ".*") + "$").test(url));
}

// инъекция с учётом Firefox
async function inject(tabId, files) {
  if (api.scripting && api.scripting.executeScript) {
    return api.scripting.executeScript({ target: { tabId }, files });
  } else {
    for (const file of files) {
      await api.tabs.executeScript(tabId, { file });
    }
  }
}

api.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;
  for (const site of siteMap) {
    if (matches(tab.url, site.match)) {
      try {
        await inject(tabId, [site.script]);
        console.log(`Injected ${site.script} into ${tab.url}`);
      } catch (err) {
        console.error("Injection failed:", err);
      }
      break;
    }
  }
});
