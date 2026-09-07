export const defaultLang = "en";

export const locales = {
  en: { label: "EN", name: "English", htmlLang: "en-US", dateLocale: "en-US" },
  ru: { label: "RU", name: "Русский", htmlLang: "ru-RU", dateLocale: "ru-RU" },
} as const;

export type Lang = keyof typeof locales;

export const langs = Object.keys(locales) as Lang[];

export const ui = {
  en: {
    "site.description": "Notes and cheat sheets about what I learn.",
    "nav.home": "Home",
    "nav.blog": "Blog",
    "nav.tags": "Tags",
    "nav.about": "About",
    "nav.search": "Search",
    "nav.menu": "Menu",
    "nav.close": "Close",
    "nav.language": "Language",
    "a11y.skip": "Skip to content",
    "home.tagline": "Notes and cheat sheets about databases, Linux, the JVM, DevOps — and whatever else comes my way.",
    "home.latest": "Latest posts",
    "home.all": "All posts",
    "blog.title": "Blog",
    "blog.published": "Published",
    "blog.updated": "Updated",
    "blog.related": "Related posts",
    "blog.toc": "On this page",
    "blog.translation": "RU",
    "blog.empty": "Nothing here yet.",
    "pagination.prev": "Newer",
    "pagination.next": "Older",
    "pagination.page": "Page",
    "tags.title": "Tags",
    "tags.tagged": "Tagged",
    "search.open": "Search",
    "search.placeholder": "Search posts…",
    "search.hint": "Type to search",
    "search.empty": "No results.",
    "search.unavailable": "The search index is built by `npm run build`. It is not available on the dev server.",
    "search.results": "results",
    "404.title": "Page not found",
    "404.text": "This page does not exist — or does not exist in this language yet.",
    "404.back": "Back to the blog",
    "footer.rss": "RSS",
    "footer.source": "Source",
  },
  ru: {
    "site.description": "Заметки и шпаргалки о том, что изучаю.",
    "nav.home": "Главная",
    "nav.blog": "Блог",
    "nav.tags": "Теги",
    "nav.about": "Обо мне",
    "nav.search": "Поиск",
    "nav.menu": "Меню",
    "nav.close": "Закрыть",
    "nav.language": "Язык",
    "a11y.skip": "Перейти к содержимому",
    "home.tagline": "Заметки и шпаргалки о базах данных, Linux, JVM, DevOps — и обо всём остальном, что попадается по пути.",
    "home.latest": "Последние записи",
    "home.all": "Все записи",
    "blog.title": "Блог",
    "blog.published": "Опубликовано",
    "blog.updated": "Обновлено",
    "blog.related": "Похожие записи",
    "blog.toc": "Содержание",
    "blog.translation": "EN",
    "blog.empty": "Пока пусто.",
    "pagination.prev": "Новее",
    "pagination.next": "Старее",
    "pagination.page": "Страница",
    "tags.title": "Теги",
    "tags.tagged": "Тег",
    "search.open": "Поиск",
    "search.placeholder": "Поиск по записям…",
    "search.hint": "Начните вводить запрос",
    "search.empty": "Ничего не найдено.",
    "search.unavailable": "Индекс поиска собирается командой `npm run build` и недоступен на дев-сервере.",
    "search.results": "результатов",
    "404.title": "Страница не найдена",
    "404.text": "Такой страницы нет — или её пока нет на этом языке.",
    "404.back": "Вернуться в блог",
    "footer.rss": "RSS",
    "footer.source": "Исходники",
  },
} as const;

export type UIKey = keyof (typeof ui)["en"];

export function useTranslations(lang: Lang) {
  return (key: UIKey): string => ui[lang][key];
}

/** `/ru/blog/docker/` -> `ru` */
export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split("/");
  return first === "ru" ? "ru" : defaultLang;
}

export function readingTimeLabel(lang: Lang, minutes: number): string {
  if (lang === "en") return `${minutes} min read`;
  return `${minutes} мин чтения`;
}

export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(locales[lang].dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
