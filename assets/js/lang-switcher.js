// assets/js/lang-switcher.js
// Toggles the lang-switcher dropdown on click. Closes on outside click
// and on Escape. Re-runs after InstantClick page changes (no-op then).

(function () {
  function bindSwitchers() {
    document.querySelectorAll(".lang-switcher").forEach((root) => {
      const button = root.querySelector(".lang-current");
      const dropdown = root.querySelector(".lang-dropdown");
      if (!button || !dropdown || button.dataset.bound === "1") return;
      button.dataset.bound = "1";

      const close = () => {
        dropdown.style.display = "";
        button.setAttribute("aria-expanded", "false");
      };
      const open = () => {
        dropdown.style.display = "block";
        button.setAttribute("aria-expanded", "true");
      };
      const toggle = () => {
        if (button.getAttribute("aria-expanded") === "true") close();
        else open();
      };

      button.addEventListener("click", (e) => {
        e.stopPropagation();
        toggle();
      });

      document.addEventListener("click", (e) => {
        if (!root.contains(e.target)) close();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindSwitchers, { once: true });
  } else {
    bindSwitchers();
  }

  document.addEventListener("instantclick:newpage", bindSwitchers);
})();