// Keyboard shortcuts + fun effects on the splash desk.
// Click handlers on keyboard function keys:
//   ENTER  -> self-type JORDANNEWELL
//   SPACE  -> CRT scanline sweep
//   BKSP   -> scattered letters spin
//   CAPS   -> Matrix rain (also via konami code)
// Physical keys Enter / Space / Backspace mirror the click actions.
// Konami code (↑↑↓↓←→←→ba) also triggers Matrix rain.
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

  // ---- Effect 2: CRT scanline sweep ----
  function scanline() {
    const old = document.querySelector(".kb-scanline");
    if (old) old.remove();
    const line = document.createElement("div");
    line.className = "kb-scanline";
    document.body.appendChild(line);
    setTimeout(() => line.remove(), 750);
  }

  // ---- Effect 3: Scattered letters spin ----
  function letterSpin() {
    const letters = Array.from(document.querySelectorAll(".cs-key"));
    letters.forEach((letter, i) => {
      setTimeout(() => {
        letter.classList.add("kb-spin");
        setTimeout(() => letter.classList.remove("kb-spin"), 700);
      }, i * 45);
    });
  }

  // ---- Effect 4: Matrix rain ----
  function matrixGlitch() {
    if (document.querySelector(".kb-matrix")) return;
    const overlay = document.createElement("div");
    overlay.className = "kb-matrix";
    document.body.appendChild(overlay);
    const cols = Math.floor(window.innerWidth / 18);
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
    }
    setTimeout(() => overlay.remove(), 4000);
  }

  // ---- Effect 5: CRT power off / on ----
  function isPoweredOff() {
    return document.body.classList.contains("cs-powered-off");
  }

  function powerOff() {
    if (isPoweredOff()) return;
    document.body.classList.add("cs-powered-off");
  }

  function powerOn() {
    document.body.classList.remove("cs-powered-off");
  }

  function powerToggle() {
    if (isPoweredOff()) powerOn();
    else powerOff();
  }

  // ---- Action dispatch ----
  const ACTIONS = {
    launch: selfType,
    scanline: scanline,
    spin: letterSpin,
    matrix: matrixGlitch,
  };

  // ---- Konami code: rolling buffer (more forgiving than state machine) ----
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  const KONAMI_DISPLAY = "↑↑↓↓←→←→ba";
  const buffer = [];

  function showKonamiProgress(matched) {
    let hint = document.querySelector(".kb-konami-hint");
    if (matched === 0) {
      if (hint) hint.remove();
      return;
    }
    if (!hint) {
      hint = document.createElement("div");
      hint.className = "kb-konami-hint";
      document.body.appendChild(hint);
    }
    const done = KONAMI_DISPLAY.slice(0, matched);
    const rest = KONAMI_DISPLAY.slice(matched);
    hint.innerHTML = '<span class="kb-konami-done">' + done + '</span>' + rest + '_';
  }

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

    const powerBtn = document.querySelector(".cs-power-btn");
    if (powerBtn) {
      powerBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        powerToggle();
      });
    }

    document.addEventListener("keydown", function (e) {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;

      // Konami buffer tracking — show progress for longest matching prefix
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        buffer.push(key);
        if (buffer.length > KONAMI.length) buffer.shift();

        // Compute longest matching prefix from buffer start
        let matched = 0;
        for (let i = 0; i < buffer.length; i++) {
          if (buffer[i] === KONAMI[i]) matched = i + 1;
          else { matched = 0; break; }
        }
        showKonamiProgress(matched);

        // Full match?
        if (matched === KONAMI.length) {
          buffer.length = 0;
          showKonamiProgress(0);
          matrixGlitch();
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
