// Keyboard function-key shortcuts on the splash desk.
// ENTER -> scroll to stream deck keypad
// SPACE -> scroll to NEWELL wordmark at bottom
// BKSP  -> scroll back to terminal at top
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function scrollToSelector(sel) {
    const el = document.querySelector(sel);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  ready(function () {
    const keyboard = document.querySelector(".cs-keyboard");
    if (!keyboard) return;

    keyboard.addEventListener("click", function (e) {
      const target = e.target.closest("[data-action]");
      if (!target) return;
      const action = target.getAttribute("data-action");
      if (action === "launch") {
        scrollToSelector(".cs-streamdeck");
      } else if (action === "bottom") {
        scrollToSelector(".cs-splash-wordmark");
      } else if (action === "top") {
        scrollToSelector("[data-terminal]");
      }
    });

    // Physical keyboard shortcuts too (when not focused in an input).
    document.addEventListener("keydown", function (e) {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Enter") {
        scrollToSelector(".cs-streamdeck");
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        scrollToSelector(".cs-splash-wordmark");
      } else if (e.key === "Backspace") {
        scrollToSelector("[data-terminal]");
      }
    });
  });
})();
