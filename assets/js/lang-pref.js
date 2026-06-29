// assets/js/lang-pref.js
// Persist the user's chosen locale across pages.
//
// Hugo URL scheme for this site:
//   default language (en): /about/, /posts/foo/, /tags/, etc.
//   other languages (ru):  /ru/about/, /ru/posts/foo/, etc.
//
// On every page load, if localStorage["pref-lang"] is set and differs
// from the current page's language, redirect to the equivalent URL
// in the saved language. When the user clicks a language in the
// switcher, persist their choice.

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
        return pathname.slice(lang.length + 1); // "/foo" -> "/foo"
      }
    }
    return pathname;
  }

  function addPrefix(pathname, lang) {
    if (lang === document.documentElement.lang) return pathname;
    return "/" + lang + (pathname === "/" ? "/" : pathname);
  }

  function redirectToSaved() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const current = currentLangFromPath(window.location.pathname);
    if (saved === current) return;

    const path = stripPrefix(window.location.pathname);
    const target = addPrefix(path, saved);
    if (target !== window.location.pathname) {
      window.location.replace(target);
    }
  }

  function bindSwitcherPersistence() {
    document.querySelectorAll(".lang-switcher .lang-link").forEach((a) => {
      if (a.dataset.bound === "1") return;
      a.dataset.bound = "1";
      a.addEventListener("click", () => {
        const lang = a.getAttribute("hreflang");
        if (lang) localStorage.setItem(STORAGE_KEY, lang);
      });
    });
  }

  function init() {
    redirectToSaved();
    bindSwitcherPersistence();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("instantclick:newpage", bindSwitcherPersistence);
})();