// Keyboard shortcuts + fun effects on the splash desk.
// Click handlers: ENTER on keyboard -> self-type JORDAN NEWELL
//                 SPACE -> CRT scanline sweep
//                 BKSP  -> scattered letters spin
// Physical keyboard: Enter / Space / Backspace do the same.
// Konami code (↑↑↓↓←→←→ba) -> page-wide Matrix glitch.
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  // ---- Effect 1: Self-type JORDAN NEWELL on the empty sockets ----
  async function selfType() {
    const order = ["J","O","R","D","A","N","N","E","W","E","L","L"];
    const sockets = Array.from(document.querySelectorAll(".kb-socket"));
    if (!sockets.length) return;
    // Reset any in-flight animation
    sockets.forEach((s) => s.classList.remove("kb-typed"));
    for (const letter of order) {
      const matches = sockets.filter((s) => s.getAttribute("data-letter") === letter);
      matches.forEach((s) => {
        s.classList.add("kb-typed");
        setTimeout(() => s.classList.remove("kb-typed"), 280);
      });
      await sleep(170);
    }
  }

  // ---- Effect 2: CRT scanline sweep top-to-bottom ----
  function scanline() {
    const old = document.querySelector(".kb-scanline");
    if (old) old.remove();
    const line = document.createElement("div");
    line.className = "kb-scanline";
    document.body.appendChild(line);
    setTimeout(() => line.remove(), 750);
  }

  // ---- Effect 3: Scattered letters spin 360 ----
  function letterSpin() {
    const letters = Array.from(document.querySelectorAll(".cs-key"));
    letters.forEach((letter, i) => {
      setTimeout(() => {
        letter.classList.add("kb-spin");
        setTimeout(() => letter.classList.remove("kb-spin"), 700);
      }, i * 45);
    });
  }

  // ---- Konami code: page-wide Matrix glitch ----
  function matrixGlitch() {
    const overlay = document.createElement("div");
    overlay.className = "kb-matrix";
    document.body.appendChild(overlay);
    // Falling glyph columns
    const cols = Math.floor(window.innerWidth / 18);
    const spans = [];
    for (let i = 0; i < cols; i++) {
      const col = document.createElement("div");
      col.className = "kb-matrix-col";
      col.style.left = (i * 18) + "px";
      col.style.animationDuration = (1.4 + Math.random() * 1.6) + "s";
      col.style.animationDelay = (Math.random() * 0.6) + "s";
      const chars = [];
      const len = 12 + Math.floor(Math.random() * 18);
      for (let j = 0; j < len; j++) {
        chars.push(String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96)));
      }
      col.textContent = chars.join("\n");
      overlay.appendChild(col);
      spans.push(col);
    }
    setTimeout(() => overlay.remove(), 4000);
  }

  // ---- Action dispatch ----
  const ACTIONS = {
    launch: selfType,    // ENTER
    bottom: scanline,    // SPACE
    top: letterSpin,     // BKSP
  };

  ready(function () {
    const keyboard = document.querySelector(".cs-keyboard");
    if (keyboard) {
      keyboard.addEventListener("click", function (e) {
        const target = e.target.closest("[data-action]");
        if (!target) return;
        const action = target.getAttribute("data-action");
        if (ACTIONS[action]) ACTIONS[action]();
      });
    }

    // Physical keyboard
    const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let konamiIdx = 0;
    document.addEventListener("keydown", function (e) {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;

      // Konami tracking (ignore modifier keys)
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (key === KONAMI[konamiIdx]) {
          konamiIdx++;
          if (konamiIdx === KONAMI.length) {
            konamiIdx = 0;
            matrixGlitch();
          }
        } else {
          konamiIdx = key === KONAMI[0] ? 1 : 0;
        }
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") {
        selfType();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        scanline();
      } else if (e.key === "Backspace") {
        letterSpin();
      }
    });
  });
})();
