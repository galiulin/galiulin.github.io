// assets/js/lang-pref.js
// Persist the user's chosen locale across pages by rewriting internal
// link hrefs to the saved language, instead of redirecting.
//
// Hugo URL scheme for this site:
//   default language (en): /about/, /posts/foo/, /tags/, etc.
//   other languages (ru):  /ru/about/, /ru/posts/foo/, etc.

(function () {
  const STORAGE_KEY = "pref-lang";

  // Sub-path locales. The default language has no prefix in URLs.
  const PREFIXED = ["ru"];

  function currentLangFromPath(pathname) {
    for (const lang of PREFIXED) {
      if (pathname === "/" + lang || pathname.startsWith("/" + lang + "/")) {
        return lang;
      }
    }
    return document.documentElement.lang;
  }

  function stripPrefix(pathname) {
    for (const lang of PREFIXED) {
      if (pathname === "/" + lang) return "/";
      if (pathname.startsWith("/" + lang + "/")) {
        return pathname.slice(lang.length + 1);
      }
    }
    return pathname;
  }

  function translatePath(pathname, toLang) {
    const stripped = stripPrefix(pathname);
    if (toLang === document.documentElement.lang) return stripped;
    return "/" + toLang + (stripped === "/" ? "/" : stripped);
  }

  // Normalise an href to its absolute path. Returns null if it's not an
  // internal link we should rewrite (external, mailto, anchor, etc.).
  function pathFromHref(href) {
    if (!href) return null;
    if (href.startsWith("#")) return null;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return null;
    if (href.startsWith("javascript:")) return null;
    // Protocol-relative: //example.com/foo
    if (href.startsWith("//")) return null;
    // Same-origin absolute: http://host/path or https://host/path
    try {
      const u = new URL(href, window.location.origin);
      if (u.origin !== window.location.origin) return null;
      return u.pathname + u.search + u.hash;
    } catch (e) {
      return null;
    }
  }

  function rewriteLinks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const currentLang = currentLangFromPath(window.location.pathname);
    if (saved === currentLang) return;

    document.querySelectorAll("a[href]").forEach((a) => {
      if (a.dataset.langPrefBound === "1") return;
      const raw = a.getAttribute("href");
      const path = pathFromHref(raw);
      if (!path) {
        a.dataset.langPrefBound = "1";
        return;
      }
      const translated = translatePath(path, saved);
      if (translated !== path) {
        // Preserve absolute form to match Hugo output style.
        a.setAttribute("href", new URL(translated, window.location.origin).toString());
      }
      a.dataset.langPrefBound = "1";
    });
  }

  function bindSwitcherPersistence() {
    document.querySelectorAll(".lang-switcher .lang-link").forEach((a) => {
      if (a.dataset.bound === "1") return;
      a.dataset.bound = "1";
      a.addEventListener("click", () => {
        const lang = a.getAttribute("hreflang");
        if (lang) {
          localStorage.setItem(STORAGE_KEY, lang);
          // After navigation, the new page will rewrite its own links.
        }
      });
    });
  }

  function init() {
    rewriteLinks();
    bindSwitcherPersistence();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("instantclick:newpage", () => {
    // Reset bound marker so links on the new page are rewritten too.
    document.querySelectorAll('a[data-lang-pref-bound="1"]').forEach((a) => {
      delete a.dataset.langPrefBound;
    });
    init();
  });
})();