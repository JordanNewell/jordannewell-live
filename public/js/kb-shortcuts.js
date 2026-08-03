// Keyboard shortcuts + fun effects on the splash desk.
// Click handlers on keyboard function keys:
//   ENTER  -> self-type JORDANNEWELL
//   SPACE  -> CRT scanline sweep
//   BKSP   -> scattered letters spin
//   CAPS   -> Matrix rain (also via konami code)
// Physical keys Enter / Space / Backspace mirror the click actions.
// Konami code (↑↑↓↓←→←→ba) also triggers Matrix rain.
(function () {
  // Page is born DEAD — <body> ships with class="cs-powered-off" in
  // BaseLayout.astro so the off-state renders on first paint (no flash
  // of the alive state). User clicks the knob to wake it.
  // After first frame, add cs-ready so transitions can play normally
  // (CSS gates transitions on body:not(.cs-ready) to prevent the
  // initial alive → off transition flash).
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("cs-ready");
    });
  });
  // Set initial favicon to match the (dead on arrival) power state
  updateFavicon();

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
      audio.clack(); // typewriter clack per letter
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
    audio.zap();
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
    audio.whoosh();
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
    audio.matrixSound();
  }

  // ---- Effect 5: CRT power off / on ----
  function isPoweredOff() {
    return document.body.classList.contains("cs-powered-off");
  }

  // Live favicon — swaps the browser tab icon to match power state.
  // Inline SVG (no file needed) with the same radial-gradient LED look
  // as the status indicator: green when ON, red when OFF.
  // Transparent background — browser/platform provides its own
  // container bg (white circle on iOS, dark on Android, etc.).
  function updateFavicon() {
    const off = isPoweredOff();
    const light = off ? "#ffb8b8" : "#b8ffba";
    const mid = off ? "#ff4040" : "#3FFF46";
    const dark = off ? "#8a1f1f" : "#1f8a23";
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>" +
      "<defs><radialGradient id='g' cx='30%' cy='28%'>" +
      "<stop offset='0%' stop-color='" + light + "'/>" +
      "<stop offset='55%' stop-color='" + mid + "'/>" +
      "<stop offset='100%' stop-color='" + dark + "'/>" +
      "</radialGradient></defs>" +
      "<circle cx='16' cy='16' r='12' fill='url(%23g)'/>" +
      "<circle cx='12' cy='12' r='3' fill='white' fill-opacity='0.7'/>" +
      "</svg>";
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = "data:image/svg+xml," + svg.replace(/#/g, "%23");
  }

  function powerOff() {
    if (isPoweredOff()) return;
    document.body.classList.add("cs-powered-off");
    updateFavicon();
  }

  function powerOn() {
    document.body.classList.remove("cs-powered-off");
    document.body.classList.add("cs-powering-on");
    setTimeout(() => document.body.classList.remove("cs-powering-on"), 800);
    updateFavicon();
  }

  function powerToggle() {
    if (isPoweredOff()) {
      audio.powerOn();
      // Restart ambient hum after the wake sweep finishes (only if user opted in)
      setTimeout(() => audio.startAmbient(), audio.enabled ? 950 : 0);
      powerOn();
    } else {
      audio.stopAmbient();
      audio.powerOff();
      // If music is playing, the speaker gets its wire yanked.
      if (music.current !== null) {
        audio.wirePull();
        music.stop();
      }
      powerOff();
    }
  }

  // ---- Effect 6: Spotlight a random launch key ----
  function spotlight() {
    const keys = Array.from(document.querySelectorAll(".cs-sd-key"));
    if (!keys.length) return;
    const key = keys[Math.floor(Math.random() * keys.length)];
    key.classList.remove("cs-sd-spotlight");
    void key.offsetWidth; // reflow to restart animation
    key.classList.add("cs-sd-spotlight");
    setTimeout(() => key.classList.remove("cs-sd-spotlight"), 1500);
    audio.chime();
  }

  // ---- Effect 7: Launch-pad glitch — cycles 4 visual variants per press ----
  let glitchStep = 0;
  const GLITCH_CLASSES = ["cs-glitch", "cs-glitch-rgb", "cs-glitch-shake", "cs-glitch-flash"];
  function glitch() {
    const bezel = document.querySelector(".cs-sd-bezel");
    if (!bezel) return;
    const cls = GLITCH_CLASSES[glitchStep % GLITCH_CLASSES.length];
    GLITCH_CLASSES.forEach((c) => bezel.classList.remove(c));
    void bezel.offsetWidth; // reflow to restart animation
    bezel.classList.add(cls);
    setTimeout(() => bezel.classList.remove(cls), 500);
    audio.playRickRoll();
    glitchStep++;
  }

  // ---- Audio system (Web Audio API, synthesized — no files) ----
  // Opt-in via the toggle button in the bottom bar. Persists in localStorage.
  // Sounds: ambient CRT hum (60Hz + 15kHz whine), key clack on every effect,
  // power-on/off sweeps. Off by default per browser autoplay policy.
  const audio = {
    ctx: null,
    enabled: false,
    ambient: null,
    masterGain: null,
    analyser: null,
    freqData: null,
    rickEl: null,

    init() {
      if (this.ctx) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        // Analyser sits between masterGain and destination so the viz strip
        // sees every sound that goes out: ambient hum, key clacks, AND music.
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;                 // 32 bins — enough for a thin strip
        this.analyser.smoothingTimeConstant = 0.55;
        this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.8;
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      } catch (err) {
        // AudioContext unavailable — silently no-op
      }
    },

    toggle() {
      this.init();
      if (!this.ctx) return false;
      // iOS Safari requires resume() in the user-gesture handler, and
      // ambient must wait for the Promise to resolve or it won't sound.
      const resumeAndStart = () => {
        if (this.enabled) this.startAmbient();
      };
      if (this.ctx.state === "suspended") {
        const p = this.ctx.resume();
        if (p && typeof p.then === "function") p.then(resumeAndStart, resumeAndStart);
        else resumeAndStart();
      }
      this.enabled = !this.enabled;
      try { localStorage.setItem("newell-audio", this.enabled ? "on" : "off"); } catch (e) {}
      if (this.enabled && this.ctx.state === "running") this.startAmbient();
      else if (!this.enabled) this.stopAmbient();
      return this.enabled;
    },

    loadPref() {
      try {
        return localStorage.getItem("newell-audio") === "on";
      } catch (e) {
        return false;
      }
    },

    startAmbient() {
      if (!this.ctx || this.ambient) return;
      const now = this.ctx.currentTime;
      // 60Hz mains hum + 120Hz harmonic
      const hum = this.ctx.createOscillator();
      hum.type = "sine";
      hum.frequency.value = 60;
      const humGain = this.ctx.createGain();
      humGain.gain.value = 0;
      humGain.gain.linearRampToValueAtTime(0.035, now + 0.6);
      hum.connect(humGain).connect(this.masterGain);
      hum.start();
      // High-voltage whine (~15kHz, sub-perceptual)
      const whine = this.ctx.createOscillator();
      whine.type = "sine";
      whine.frequency.value = 15000;
      const whineGain = this.ctx.createGain();
      whineGain.gain.value = 0;
      whineGain.gain.linearRampToValueAtTime(0.004, now + 0.8);
      whine.connect(whineGain).connect(this.masterGain);
      whine.start();
      this.ambient = { hum, humGain, whine, whineGain };
    },

    stopAmbient() {
      if (!this.ctx || !this.ambient) return;
      const now = this.ctx.currentTime;
      const fade = 0.3;
      this.ambient.humGain.gain.cancelScheduledValues(now);
      this.ambient.humGain.gain.setValueAtTime(this.ambient.humGain.gain.value, now);
      this.ambient.humGain.gain.linearRampToValueAtTime(0, now + fade);
      this.ambient.whineGain.gain.cancelScheduledValues(now);
      this.ambient.whineGain.gain.setValueAtTime(this.ambient.whineGain.gain.value, now);
      this.ambient.whineGain.gain.linearRampToValueAtTime(0, now + fade);
      const humRef = this.ambient.hum;
      const whineRef = this.ambient.whine;
      setTimeout(() => {
        try { humRef.stop(); whineRef.stop(); } catch (e) {}
      }, fade * 1000 + 50);
      this.ambient = null;
    },

    clack() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      // Mechanical key sound — 3 layered components for Cherry MX-style click:
      // 1) Sharp click transient (high-freq square burst, ~8ms)
      const click = this.ctx.createOscillator();
      click.type = "square";
      click.frequency.value = 2800 + Math.random() * 200;
      const clickGain = this.ctx.createGain();
      clickGain.gain.setValueAtTime(0.14, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);
      click.connect(clickGain).connect(this.masterGain);
      click.start(now);
      click.stop(now + 0.012);
      // 2) Body thock — bandpassed noise ~1kHz, ~40ms decay
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.045, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1000 + Math.random() * 300;
      filter.Q.value = 1.2;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.22, now + 0.001);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      src.connect(filter).connect(noiseGain).connect(this.masterGain);
      src.start(now);
      src.stop(now + 0.05);
      // 3) Low resonance — sine ~180Hz, ~60ms (the "bottom" of the keystroke)
      const body = this.ctx.createOscillator();
      body.type = "sine";
      body.frequency.value = 180 + Math.random() * 40;
      const bodyGain = this.ctx.createGain();
      bodyGain.gain.setValueAtTime(0.09, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      body.connect(bodyGain).connect(this.masterGain);
      body.start(now);
      body.stop(now + 0.075);
    },

    // CRT scanline zap — short descending sine sweep
    zap() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.4);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain).connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.5);
    },

    // Letter spin whoosh — bandpass noise sweep up then down
    whoosh() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.75, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(2200, now + 0.3);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.7);
      filter.Q.value = 2;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      src.connect(filter).connect(gain).connect(this.masterGain);
      src.start(now);
      src.stop(now + 0.75);
    },

    // Matrix rain — square pitch-down + high-freq noise (digital data feel)
    matrixSound() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 1.0);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 1.0, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 3000;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = 0.03;
      osc.connect(gain).connect(this.masterGain);
      src.connect(filter).connect(noiseGain).connect(this.masterGain);
      osc.start(now); osc.stop(now + 1.0);
      src.start(now); src.stop(now + 1.0);
    },

    // Spotlight chime — ascending bell triad
    chime() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [880, 1108.73, 1318.51]; // A5, C#6, E6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const gain = this.ctx.createGain();
        const t = now + i * 0.05;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.connect(gain).connect(this.masterGain);
        osc.start(t); osc.stop(t + 0.7);
      });
    },

    // Glitch sound — random square bursts at irregular intervals
    glitchSound() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      for (let i = 0; i < 5; i++) {
        const t = now + i * 0.08 + Math.random() * 0.04;
        const osc = this.ctx.createOscillator();
        osc.type = "square";
        osc.frequency.value = 100 + Math.random() * 800;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(gain).connect(this.masterGain);
        osc.start(t); osc.stop(t + 0.06);
      }
    },

    // Rick Roll — plays /audio/rickroll.mp3 (user-provided).
    // Uses HTMLAudioElement (not Web Audio API) so any format works.
    // Falls back to the glitch sound if the file is missing or blocked.
    // Note: copyright on the original recording is owned by Sony/RCA —
    // you must own or license the file you place at this path.
    playRickRoll() {
      if (!this.enabled) { this.glitchSound(); return; }
      if (!this.rickEl) {
        this.rickEl = new Audio("/audio/rickroll.mp3");
        this.rickEl.volume = 0.7;
      }
      this.rickEl.currentTime = 0;
      const p = this.rickEl.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => this.glitchSound());
      }
    },

    powerOff() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      // Win95-shutdown-inspired: rich descending chord (C major → octave down),
      // saw stack through a sweeping lowpass for that warm Microsoft fade.
      const notes = [261.63, 329.63, 392.00]; // C4, E4, G4
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3500, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 1.2);
      filter.Q.value = 0.7;
      filter.connect(this.masterGain);
      notes.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 1.2);
        const osc2 = this.ctx.createOscillator();
        osc2.type = "sawtooth";
        osc2.frequency.setValueAtTime(freq * 1.003, now);
        osc2.frequency.exponentialRampToValueAtTime(freq * 0.5 * 1.003, now + 1.2);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.06);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(filter);
        osc.start(now); osc2.start(now);
        osc.stop(now + 1.5); osc2.stop(now + 1.5);
      });
    },

    powerOn() {
      // Respects audio toggle — only plays if user has opted in.
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [130.81, 164.81, 196.00]; // C3, E3, G3
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(3500, now + 0.8);
      filter.Q.value = 0.7;
      filter.connect(this.masterGain);
      notes.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 2, now + 0.8);
        const osc2 = this.ctx.createOscillator();
        osc2.type = "sawtooth";
        osc2.frequency.setValueAtTime(freq * 1.003, now);
        osc2.frequency.exponentialRampToValueAtTime(freq * 2 * 1.003, now + 0.8);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.2);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(filter);
        osc.start(now); osc2.start(now);
        osc.stop(now + 1.1); osc2.stop(now + 1.1);
      });
    },

    // Speaker wire pulled — abrupt cutoff sound when power dies mid-song.
    // Low-frequency thud (DC-offset drop) + crackling noise burst (short).
    // Plays whether or not ambient audio is enabled — the user explicitly
    // killed the desk mid-song, they should hear the yank.
    wirePull() {
      this.init();
      if (!this.ctx) return;
      // If audio wasn't enabled, briefly resume the context for this one-shot
      if (this.ctx.state === "suspended") this.ctx.resume();
      const now = this.ctx.currentTime;
      // Sudden low thud — like an amplifier losing signal
      const thud = this.ctx.createOscillator();
      thud.type = "sine";
      thud.frequency.setValueAtTime(90, now);
      thud.frequency.exponentialRampToValueAtTime(20, now + 0.18);
      const thudGain = this.ctx.createGain();
      thudGain.gain.setValueAtTime(0.45, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      thud.connect(thudGain).connect(this.masterGain);
      thud.start(now); thud.stop(now + 0.22);
      // Crackling — like a cable shorting
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.32, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.25));
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1500;
      filter.Q.value = 0.6;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = 0.18;
      src.connect(filter).connect(noiseGain).connect(this.masterGain);
      src.start(now);
      src.stop(now + 0.32);
    },
  };

  // ---- Music player (separate from `audio`) — uses HTMLAudioElement.
  // Tab system: terminal has [activity] and [music] tabs at the top.
  // Music tab opens the player UI; activity tab shows the GitHub log.
  // Independent of power state: music keeps playing through power-off. ----
  const music = {
    el: null,
    source: null,
    panel: null,
    tabBtn: null,
    activityTabBtn: null,
    active: false,
    current: null,
    volume: 0.7,
    tracks: [
      { id: 1, name: "Pump It Up", file: "/audio/pump-it-up.mp3" },
      { id: 2, name: "Never Gonna Give You Up", file: "/audio/rr-mix.mp3" },
      { id: 3, name: "Baby, Baby",              file: "/audio/baby-baby.mp3" },
      { id: 4, name: "Turn Down for What",      file: "/audio/turn-down-for-what.mp3" },
      { id: 5, name: "Peru",                    file: "/audio/peru.mp3" },
      { id: 6, name: "Gimme More",              file: "/audio/gimme-more.mp3" },
      { id: 7, name: "How Will I Know",         file: "/audio/how-will-i-know.mp3" },
      { id: 8, name: "To Ü",                    file: "/audio/to-u.mp3" },
      { id: 9, name: "The Business",            file: "/audio/the-business.mp3" },
      { id: 10, name: "Everybody Wants To Rule The World", file: "/audio/everybody-wants-to-rule-the-world.mp3" },
    ],

    init() {
      if (this.el) return;
      audio.init();  // ensure ctx exists so we can tap el through analyser
      this.el = new Audio();
      this.el.volume = this.volume;
      this.el.muted = false;
      this.el.addEventListener("ended", () => { this.current = null; this.render(); });
      // Route music through masterGain → analyser → destination so the
      // terminal viz strip reacts to actual track output. One-shot per
      // element — guard with this.source. Tracks are same-origin so no
      // CORS issues.
      if (audio.ctx && audio.masterGain && !this.source) {
        try {
          this.source = audio.ctx.createMediaElementSource(this.el);
          this.source.connect(audio.masterGain);
        } catch (e) {
          // createMediaElementSource can throw on CORS or double-tap —
          // el falls back to default <audio> playback, viz just won't see it.
        }
      }
      const terminal = document.querySelector("[data-terminal]");
      if (!terminal) return;
      const body = terminal.querySelector(".terminal-body");
      const bar = terminal.querySelector(".terminal-bar");
      const socials = bar && bar.querySelector(".terminal-socials");
      if (!body || !socials) return;
      // Status strip lives outside the body (between body and audio-viz)
      // so the help line + volume row pin to the bottom of the terminal.
      this.statusEl = terminal.querySelector("[data-music-status]");

      // Tabs injected INTO socials (after GH) so they sit between the GH
      // button and the live indicator. socials has flex:1, so the tabs
      // cluster with GH on the left side, live stays centered, X on right.
      const tabs = document.createElement("div");
      tabs.className = "terminal-tabs";
      tabs.innerHTML = `
        <button class="terminal-tab is-active" data-tab="activity">activity</button>
        <button class="terminal-tab" data-tab="music">music</button>
      `;
      socials.appendChild(tabs);
      this.activityTabBtn = tabs.querySelector('[data-tab="activity"]');
      this.tabBtn = tabs.querySelector('[data-tab="music"]');
      this.activityTabBtn.addEventListener("click", () => this.switchTab("activity"));
      this.tabBtn.addEventListener("click", () => this.switchTab("music"));

      // Music content lives INSIDE terminal-body — same element, same size.
      this.panel = document.createElement("div");
      this.panel.className = "term-music-content";
      body.appendChild(this.panel);
      this.body = body;

      this.panel.addEventListener("click", (e) => {
        const row = e.target.closest("[data-track]");
        if (!row) return;
        const id = parseInt(row.getAttribute("data-track"), 10);
        this.play(id);
      });
    },

    switchTab(which) {
      this.init();
      if (which === "music") {
        this.active = true;
        if (this.tabBtn) this.tabBtn.classList.add("is-active");
        if (this.activityTabBtn) this.activityTabBtn.classList.remove("is-active");
        this.body.classList.add("music-mode");
        if (this.statusEl) this.statusEl.classList.add("is-active");
        // Music routes through audio.ctx → analyser → destination, so the
        // ctx must be RUNNING for sound to come out. Resume on the tab
        // click (user gesture) so playback works without ambient opt-in.
        if (audio.ctx && audio.ctx.state === "suspended") {
          audio.ctx.resume();
        }
        this.render();
      } else {
        this.active = false;
        if (this.activityTabBtn) this.activityTabBtn.classList.add("is-active");
        if (this.tabBtn) this.tabBtn.classList.remove("is-active");
        this.body.classList.remove("music-mode");
        if (this.statusEl) this.statusEl.classList.remove("is-active");
      }
    },

    toggle() {
      this.init();
      this.switchTab(this.active ? "activity" : "music");
    },

    open() { this.switchTab("music"); },
    close() { this.switchTab("activity"); },

    play(id) {
      this.init();
      const track = this.tracks.find((t) => t.id === id);
      if (!track) return;
      // Play IMMEDIATELY in the user gesture — Firefox and iOS Safari
      // both lose the gesture across setTimeout, blocking playback.
      // Format intro plays in parallel (overlap) instead of delaying.
      // Also resume the analyser's ctx — same gesture, covers the case
      // where the user invokes music via keyboard shortcut ([1]/[2]).
      if (audio.ctx && audio.ctx.state === "suspended") {
        audio.ctx.resume();
      }
      this.el.src = track.file;
      this.el.volume = this.volume;
      this.el.muted = false;
      this.el.load();
      const p = this.el.play();
      if (p && typeof p.catch === "function") {
        p.catch((err) => console.warn("[music] play() rejected:", err && err.name, err && err.message));
      }
      this.current = id;
      this.render();
    },

    stop() {
      if (this.el) {
        this.el.pause();
        this.el.currentTime = 0;
      }
      this.current = null;
      this.render();
    },

    bumpVolume(delta) { this.setVolume(this.volume + delta); },

    setVolume(v) {
      this.volume = Math.max(0, Math.min(1, v));
      if (this.el) this.el.volume = this.volume;
      this.render();
    },

    render() {
      if (!this.panel) return;
      const volBars = Array.from({ length: 10 }, (_, i) => {
        const on = i < Math.round(this.volume * 10) ? " is-on" : "";
        return `<span class="term-music-vol-bar${on}"></span>`;
      }).join("");
      const rows = this.tracks.map((t) => `
        <div class="term-music-track ${this.current === t.id ? "is-playing" : ""}" data-track="${t.id}">
          <span class="term-music-track-num">[${t.id}]</span>
          <span class="term-music-track-name">${this.current === t.id ? "► " : ""}${t.name}</span>
        </div>
      `).join("");
      const status = this.current !== null
        ? `♪ playing — ${this.tracks.find((t) => t.id === this.current).name}`
        : "stopped";
      // Tracks list stays in the body panel; help + volume row render
      // into the pinned status strip at the bottom of the terminal.
      this.panel.innerHTML = `
        <div class="term-music-head">newell --music</div>
        <div class="term-music-tracks">${rows}</div>
      `;
      if (this.statusEl) {
        this.statusEl.innerHTML = `
          <div class="term-music-help">[1-${this.tracks.length}] play · [S] stop · [ESC] activity tab · [+/-] volume</div>
          <div class="term-music-vol-row">
            <span>${status}</span>
            <span class="term-music-vol-bars">${volBars}</span>
            <span>${Math.round(this.volume * 100)}%</span>
          </div>
        `;
      }
    },
  };

  // ---- Always-on audio viz strip — pinned to bottom of the terminal,
  // above the © year foot. Reads the analyser that the `audio` graph
  // feeds into (ambient + clacks + music). Falls back to a flat idle
  // state when AudioContext isn't live yet. Cheap RAF, kills itself
  // on the cs-powered-off state so the CRT-off illusion isn't broken.
  const viz = {
    raf: null,
    strip: null,
    bars: null,
    heights: null,

    init() {
      if (this.raf) return;
      this.strip = document.querySelector("[data-audio-viz]");
      if (!this.strip) return;
      this.bars = Array.from(this.strip.children);
      this.heights = new Array(this.bars.length).fill(2);
      this.idle(true);
      const loop = () => {
        this.draw();
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    },

    idle(on) {
      if (!this.strip) return;
      this.strip.classList.toggle("idle", on);
    },

    draw() {
      if (!this.bars || !this.bars.length) return;
      // No analyser yet (no user gesture) — flat idle strip.
      if (!audio.analyser || !audio.freqData) {
        this.idle(true);
        for (let i = 0; i < this.bars.length; i++) {
          this.bars[i].style.height = "2px";
          this.heights[i] = 2;
        }
        return;
      }
      this.idle(false);
      audio.analyser.getByteFrequencyData(audio.freqData);
      const data = audio.freqData;
      const n = this.bars.length;
      const dataLen = data.length;
      // Skip bin 0 (DC offset), bias toward low/mid frequencies where
      // music energy actually lives. Log-ish curve via pow(1.5).
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const idx = Math.min(
          dataLen - 1,
          Math.max(1, Math.floor(Math.pow(t, 1.5) * (dataLen - 2)) + 1)
        );
        const v = data[idx] / 255;
        const target = Math.max(2, Math.pow(v, 0.85) * 100);
        // Classic VU-meter feel: rise instantly, fall on a 0.82 multiplier.
        const last = this.heights[i];
        const next = target > last ? target : last * 0.82;
        this.heights[i] = next;
        this.bars[i].style.height = next + "%";
      }
    },
  };

  // ---- LED indicators: pulse green when ANY effect fires ----
  function pulseLeds() {
    const leds = document.querySelectorAll(".cs-fx-led");
    if (!leds.length) return;
    leds.forEach((led) => led.classList.add("is-lit"));
    setTimeout(() => {
      leds.forEach((led) => led.classList.remove("is-lit"));
    }, 800);
  }

  // ---- Action dispatch ----
  const ACTIONS = {
    launch: selfType,
    scanline: scanline,
    spin: letterSpin,
    matrix: matrixGlitch,
    spotlight: spotlight,
    glitch: glitch,
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
    // Audio viz strip lives at the bottom of the terminal; runs its own
    // cheap RAF. No-op if the strip isn't in the DOM (embedded terminal).
    viz.init();

    const keyboard = document.querySelector(".cs-keyboard");
    if (keyboard) {
      keyboard.addEventListener("click", function (e) {
        const key = e.target.closest(".kb-key");
        if (!key) return;
        const action = key.getAttribute("data-action");
        if (action && ACTIONS[action]) {
          pulseLeds();
          ACTIONS[action]();
        } else {
          // Plain key click — just a mechanical clack
          audio.clack();
        }
      });
    }

    const powerBtns = document.querySelectorAll(".cs-power-btn");
    powerBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        powerToggle();
      });
    });

    // FX rack — 2 effect triggers (spotlight + glitch). LEDs pulse on fire.
    const fxButtons = document.querySelectorAll("[data-fx]");
    fxButtons.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const fx = btn.getAttribute("data-fx");
        if (ACTIONS[fx]) {
          pulseLeds();
          ACTIONS[fx]();
        }
      });
    });

    // Audio toggle button (opt-in, persists across sessions)
    const audioBtn = document.querySelector("[data-audio-toggle]");
    if (audioBtn) {
      const setVisual = (on) => audioBtn.setAttribute("aria-pressed", on ? "true" : "false");
      setVisual(false);
      audioBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const on = audio.toggle();
        setVisual(on);
        if (on) audio.clack();
      });
    }

    // Music button — opens the terminal music overlay
    const musicBtn = document.querySelector("[data-music-toggle]");
    if (musicBtn) {
      musicBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        music.toggle();
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
          if (!isPoweredOff()) {
            pulseLeds();
            matrixGlitch();
          }
        }
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Physical keys do nothing while power is OFF — desk is dead.
      // (Music is exempt — it keeps playing and stays controllable.)
      const poweredOff = isPoweredOff();

      // Music mode intercepts: number keys, S, ESC, +/-
      if (music.active) {
        if (e.key === "Escape") { music.close(); return; }
        if (e.key === "s" || e.key === "S" || e.key === "0") { music.stop(); return; }
        if (e.key === "+" || e.key === "=") { music.bumpVolume(0.05); return; }
        if (e.key === "-" || e.key === "_") { music.bumpVolume(-0.05); return; }
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= music.tracks.length) {
          music.play(num);
          return;
        }
      }

      if (poweredOff) {
        // Even when off, allow music to be opened via the 'm' key
        if (e.key === "m" || e.key === "M") { music.toggle(); }
        return;
      }
      // M opens/toggles music tab from anywhere
      if (e.key === "m" || e.key === "M") {
        music.toggle();
        return;
      }
      if (e.key === "Enter") {
        pulseLeds();
        selfType();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        pulseLeds();
        scanline();
      } else if (e.key === "Backspace") {
        pulseLeds();
        letterSpin();
      } else if (e.key === "CapsLock") {
        pulseLeds();
        matrixGlitch();
      } else if (e.key.length === 1 || ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab","Escape"].includes(e.key)) {
        // Any other plain key press — just a mechanical clack
        audio.clack();
      }
    });
  });
})();
